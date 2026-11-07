import {
  BudgetEnforcementEnum,
  CallOfferingComponentBounds,
  NestedRound,
  OnDepletedEnum,
  PlannedOutcomeEnum,
} from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';

/** The table of the call's resource pools, a component by round matrix. */
export const RESOURCE_POOLS_TABLE = 'CallResourcePools';

/** The call's pool usage as a query, for whatever reads it outside the
 * pools matrix. Without a call, every call's. */
export const callResourcePoolUsageKey = (callUuid?: string) =>
  callUuid ? ['callResourcePoolUsage', callUuid] : ['callResourcePoolUsage'];

export const proposalBudgetKey = (proposalUuid?: string) =>
  proposalUuid ? ['ProposalBudget', proposalUuid] : ['ProposalBudget'];

/**
 * What a change to a pool or to an award makes stale: the call's pools
 * matrix, the pools summary of the calls list and the proposals' budget
 * panels.
 */
export const BUDGET_QUERIES = [
  { queryKey: ['table', RESOURCE_POOLS_TABLE] },
  { queryKey: callResourcePoolUsageKey() },
  { queryKey: proposalBudgetKey() },
];

export const getBudgetEnforcementOptions = (): {
  value: BudgetEnforcementEnum;
  label: string;
}[] => [
  {
    value: 'soft',
    label: translate('Soft: approving past the budget needs an override'),
  },
  {
    value: 'hard',
    label: translate('Hard: an award past the budget is refused'),
  },
];

export const getOnDepletedOptions = (): {
  value: OnDepletedEnum;
  label: string;
}[] => [
  { value: 'decline', label: translate('Decline it') },
  { value: 'leave', label: translate('Leave it to decide by hand') },
];

export const getPlannedOutcomeLabel = (outcome: PlannedOutcomeEnum) =>
  ({
    approved: translate('Approve'),
    declined: translate('Decline'),
    left: translate('Leave undecided'),
    skipped: translate('Skip'),
  })[outcome] ?? outcome;

/** The rule a call sets on a request of ``componentType`` of an offering. */
export const findComponentRule = (
  rules: CallOfferingComponentBounds[] | undefined,
  requestedOfferingUuid: string,
  componentType: string,
): CallOfferingComponentBounds | undefined =>
  (rules ?? []).find(
    (rule) =>
      rule.requested_offering_uuid === requestedOfferingUuid &&
      rule.component_type === componentType,
  );

/** The component types of the offering whose amount the call fixes. */
export const fixedRuleComponents = (
  rules: CallOfferingComponentBounds[] | undefined,
  requestedOfferingUuid: string,
): Set<string> =>
  new Set(
    (rules ?? [])
      .filter(
        (rule) =>
          rule.is_fixed &&
          rule.requested_offering_uuid === requestedOfferingUuid,
      )
      .map((rule) => rule.component_type),
  );

/** "500 core-hours", or the bare number for a component counted in units. */
export const formatAmount = (
  value: number | string | null | undefined,
  unit?: string | null,
) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const amount = Number(value).toLocaleString();
  return unit ? `${amount} ${unit}` : amount;
};

/** How a component is counted: its unit, per month or quarter where so. */
export const formatComponentUnit = (
  unit?: string | null,
  limitPeriod?: string | null,
) => {
  const period =
    {
      month: translate('per month'),
      quarterly: translate('per quarter'),
      annual: translate('per year'),
    }[limitPeriod ?? ''] ?? '';
  return [unit, period].filter(Boolean).join(' ');
};

/** The help text a request is held to by its component rule, or undefined. */
export const formatRuleBounds = (
  rule: CallOfferingComponentBounds | undefined,
): string | undefined => {
  if (!rule) {
    return undefined;
  }
  const unit = rule.measured_unit;
  if (rule.is_fixed) {
    return translate('Fixed at {amount}.', {
      amount: formatAmount(rule.default_amount, unit),
    });
  }
  const low = rule.min_per_proposal;
  const high = rule.max_per_proposal;
  if (low !== null && high !== null) {
    return translate('Between {low} and {high}.', {
      low: formatAmount(low, unit),
      high: formatAmount(high, unit),
    });
  }
  if (low !== null) {
    return translate('At least {low}.', { low: formatAmount(low, unit) });
  }
  if (high !== null) {
    return translate('At most {high}.', { high: formatAmount(high, unit) });
  }
  return undefined;
};

/**
 * The field-level check a requested amount is held to by its rule, or
 * undefined where the rule bounds nothing or fixes the amount (the form sets
 * a fixed amount itself). An empty amount passes, as the offering's own
 * minimum does: whether a component may be left out is the backend's call.
 */
export const getRuleBoundsValidator = (
  rule: CallOfferingComponentBounds | undefined,
): ((value: unknown) => string | undefined) | undefined => {
  if (!rule || rule.is_fixed) {
    return undefined;
  }
  const low = rule.min_per_proposal;
  const high = rule.max_per_proposal;
  if (low === null && high === null) {
    return undefined;
  }
  const message = translate('Outside what the call allows. {bounds}', {
    bounds: formatRuleBounds(rule),
  });
  return (value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const amount = Number(value);
    if (Number.isNaN(amount)) {
      return undefined;
    }
    if (low !== null && amount < low) {
      return message;
    }
    if (high !== null && amount > high) {
      return message;
    }
    return undefined;
  };
};

/** An amount, or "Unlimited" for a total that is not set. */
export const formatBudgetAmount = (value: number | null | undefined) =>
  value === null || value === undefined
    ? translate('Unlimited')
    : value.toLocaleString();

/**
 * A round's proposals are allocated in submission order once its cut-off
 * has passed, until the round is completed.
 */
export const canAllocateInSubmissionOrder = (
  round: Pick<NestedRound, 'status' | 'lifecycle_state'>,
) => round.status === 'ended' && round.lifecycle_state !== 'closed';

/**
 * The refusal to allocate while proposals of the round have not reached the
 * allocation decision, with how many; null for any other error.
 */
export const getWaitingRefusal = (
  error: any,
): { count: number; detail: string } | null => {
  const status = error?.status ?? error?.response?.status;
  if (status !== 400) return null;
  const body = getErrorBody(error) as
    { waiting_count?: number; detail?: string } | undefined;
  if (typeof body?.waiting_count !== 'number') return null;
  return { count: body.waiting_count, detail: body.detail ?? '' };
};

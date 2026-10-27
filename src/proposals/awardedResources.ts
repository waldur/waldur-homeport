import { useQuery } from '@tanstack/react-query';
import {
  AwardedResource,
  proposalProposalsAwardedResourcesList,
  ProposalWorkflowStepInstance,
  RequestedResource,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { translate } from '@/i18n';
import {
  getOptionKeys,
  OfferingOptionsLike,
} from '@/marketplace/common/requiredOptions';
import { formatOptionValue } from '@/marketplace/resources/options/OptionValue';
import { PREPAID_DURATION_MONTHS } from '@/proposals/prepaidDuration';
import { getRowLimits } from '@/proposals/requestedResourceCost';
import { getRequestOptionSummary } from '@/proposals/requestedResourceOptions';
import { HELD_DECISION_STEP } from '@/proposals/roundLifecycle';
import { Proposal } from '@/proposals/types';

export const awardedResourcesKey = (proposalUuid: string) =>
  ['proposal-awarded-resources', proposalUuid] as const;

const isForbidden = (error: any) =>
  error?.response?.status === 403 || error?.status === 403;

/**
 * What the allocation decision awards the proposal.
 *
 * Resolves to null when the viewer may not read it: the applicant before the
 * decision is released (and while a decision is held for the round's
 * publication, even where the call shows the award to applicants),
 * reviewers and panel members always. That is a
 * "not shown", not an error — the award is simply not theirs to see yet — so
 * the 403 is settled here instead of reaching the global handler, which would
 * send the whole page to the no-permission screen.
 */
export const useAwardedResources = (proposalUuid: string, enabled: boolean) =>
  useQuery({
    queryKey: awardedResourcesKey(proposalUuid),
    queryFn: () =>
      getAllPages<AwardedResource>((page) =>
        proposalProposalsAwardedResourcesList({
          path: { uuid: proposalUuid },
          query: { page, page_size: MAX_PAGE_SIZE },
        }),
      ).catch((error) => {
        if (isForbidden(error)) {
          return null;
        }
        throw error;
      }),
    enabled: Boolean(proposalUuid) && enabled,
    refetchOnWindowFocus: false,
    meta: { skipGlobalErrorRedirect: true },
  });

/**
 * Whether the allocation decision is open, so the award may still change. A
 * decision that is recorded but held for the round's publication is closed:
 * the backend refuses award edits (409) until the decision is reopened, which
 * makes the allocation step active again. `decision_held` is null for
 * viewers who may not know about held decisions, who never edit anyway.
 */
export const isAwardDecisionOpen = (
  proposal: Pick<Proposal, 'decision_held'>,
  activeStep: Pick<ProposalWorkflowStepInstance, 'step'> | undefined,
) => activeStep?.step === HELD_DECISION_STEP && proposal.decision_held !== true;

/**
 * Whether the viewer is offered the award editor: a call manager (or staff)
 * while the allocation decision is open.
 */
export const canEditAward = (
  canDecide: boolean,
  proposal: Pick<Proposal, 'decision_held'>,
  activeStep: Pick<ProposalWorkflowStepInstance, 'step'> | undefined,
) => canDecide && isAwardDecisionOpen(proposal, activeStep);

/**
 * Whether the proposal has got as far as an allocation decision, so an award
 * can exist. Before that there is nothing to ask for.
 */
export const hasReachedAllocationDecision = (
  proposal: Pick<Proposal, 'state'>,
  workflowStates: ProposalWorkflowStepInstance[] | undefined,
) =>
  proposal.state === 'accepted' ||
  (workflowStates ?? []).some(
    (s) =>
      (s.step === 'allocation_decision' || s.step === 'award_response') &&
      s.status !== 'pending' &&
      s.status !== 'skipped',
  );

/** The award section's anchor, which the page's progress rail links to. */
export const AWARDED_RESOURCES_SECTION_ID = 'step-awarded-resources';

/**
 * Whether the award section is on the page once the award has loaded: never
 * for a viewer refused it (null), and for a reader only when something is
 * awarded. The editor shows even while empty, so the first item can be added.
 */
export const isAwardSectionShown = (
  awards: AwardedResource[] | null | undefined,
  editable: boolean,
) => Array.isArray(awards) && (editable || awards.length > 0);

/**
 * The page's progress rail with the award section in it, right after the
 * request it answers, when the section is shown.
 */
export const withAwardedResourcesStep = <T extends { id: string }>(
  steps: T[],
  shown: boolean,
): Array<T | { id: string; label: string }> => {
  if (!shown) {
    return steps;
  }
  const step = {
    id: AWARDED_RESOURCES_SECTION_ID,
    label: translate('Awarded resources'),
  };
  const after = steps.findIndex((s) => s.id === 'step-resource-requests');
  return after === -1
    ? [...steps, step]
    : [...steps.slice(0, after + 1), step, ...steps.slice(after + 1)];
};

type AwardChange = 'unchanged' | 'changed' | 'moved' | 'added' | 'removed';

/** One line of the award set against the request it came from, if any. */
export interface AwardComparisonRow {
  uuid: string;
  requested?: RequestedResource;
  awarded?: AwardedResource;
  change: AwardChange;
  /** Options the award answers differently from the request, if any. */
  changedOptions?: string[];
  /** The options the line answers, as shown; see getAwardOptionLines. */
  optionLines?: AwardOptionLine[];
}

const sameLimits = (a: Record<string, number>, b: Record<string, number>) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => Number(a[key] ?? 0) === Number(b[key] ?? 0));
};

const prepaidMonths = (attributes?: Record<string, unknown> | null) =>
  Number(attributes?.[PREPAID_DURATION_MONTHS] ?? 0);

const sortKey = (value: unknown) =>
  value !== null && typeof value === 'object'
    ? JSON.stringify(value)
    : String(value);

/**
 * An answer as it reads, so that answers which read the same are the same: 4
 * and "4", "<p>a</p>" and "a", "<p></p>" and nothing, a multiple choice in any
 * order. On top of the shared empty-value rule (isEmptyOptionValue, which
 * formatOptionValue applies), an unticked box and an empty multiple choice
 * count as no answer here: neither is shown, so a difference would be
 * invisible.
 */
const normalizeOptionValue = (option, value: unknown): string | null => {
  if (value === false || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  const comparable = Array.isArray(value)
    ? [...value].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
    : value;
  return formatOptionValue(option, comparable);
};

type OptionsCarrier = Pick<RequestedResource, 'requested_offering'> & {
  attributes?: Record<string, unknown> | null;
};

const optionKeys = (item: OptionsCarrier): string[] =>
  getOptionKeys(item.requested_offering?.options as OfferingOptionsLike);

/**
 * The offering's options the award answers differently from the request: a
 * QoS the call manager changed, say. The subscription period is compared on
 * its own.
 */
const changedOptionKeys = (
  requested: OptionsCarrier,
  awarded: OptionsCarrier,
): string[] => {
  const fields = (awarded.requested_offering?.options as any)?.options ?? {};
  return optionKeys(awarded).filter(
    (key) =>
      key !== PREPAID_DURATION_MONTHS &&
      normalizeOptionValue(fields[key], requested.attributes?.[key]) !==
        normalizeOptionValue(fields[key], awarded.attributes?.[key]),
  );
};

const compareItem = (
  requested: RequestedResource,
  awarded: AwardedResource,
  changedOptions: string[],
): AwardChange => {
  if (awarded.requested_offering.uuid !== requested.requested_offering.uuid) {
    return 'moved';
  }
  const requestedPlan = requested.requested_offering.plan_details?.uuid;
  if (awarded.plan && requestedPlan && awarded.plan !== requestedPlan) {
    return 'changed';
  }
  if (!sameLimits(getRowLimits(requested), getRowLimits(awarded))) {
    return 'changed';
  }
  if (
    prepaidMonths(requested.attributes) !== prepaidMonths(awarded.attributes)
  ) {
    return 'changed';
  }
  // Only an option changed — a QoS — is still not what was asked for.
  if (changedOptions.length) {
    return 'changed';
  }
  return 'unchanged';
};

/**
 * Pairs each award item with the request it was prefilled from.
 *
 * Award order first — that is the order it provisions in — then every request
 * the award no longer covers, so "asked for, not granted" stays visible.
 */
export const compareAward = (
  requests: RequestedResource[],
  awards: AwardedResource[],
): AwardComparisonRow[] => {
  const byUuid = new Map(requests.map((r) => [r.uuid, r]));
  const covered = new Set<string>();
  const rows: AwardComparisonRow[] = awards.map((awarded) => {
    const requested = awarded.requested_resource
      ? byUuid.get(awarded.requested_resource)
      : undefined;
    if (!requested) {
      return { uuid: awarded.uuid, awarded, change: 'added' };
    }
    covered.add(requested.uuid);
    // Set against the request only on the same offering: another one has
    // other options.
    const changedOptions =
      awarded.requested_offering.uuid === requested.requested_offering.uuid
        ? changedOptionKeys(requested, awarded)
        : [];
    return {
      uuid: awarded.uuid,
      requested,
      awarded,
      change: compareItem(requested, awarded, changedOptions),
      changedOptions,
    };
  });
  for (const requested of requests) {
    if (!covered.has(requested.uuid)) {
      rows.push({ uuid: requested.uuid, requested, change: 'removed' });
    }
  }
  // Worked out once here, where the comparison is memoised, rather than by
  // every cell on every render.
  return rows.map((row) => ({ ...row, optionLines: getAwardOptionLines(row) }));
};

export const awardDiffers = (rows: AwardComparisonRow[]) =>
  rows.some((row) => row.change !== 'unchanged');

/**
 * Only the amounts the chosen offering has components for. An item moved to
 * another offering may still hold the old one's amounts, and the backend
 * refuses a limit it does not recognise.
 */
export const pickOfferingLimits = (
  limits: Record<string, number> | undefined,
  offering: { components?: Array<{ type: string }> } | undefined,
): Record<string, number> => {
  if (!limits) {
    return {};
  }
  if (!offering?.components?.length) {
    return limits;
  }
  const types = new Set(offering.components.map((c) => c.type));
  return Object.fromEntries(
    Object.entries(limits).filter(([type]) => types.has(type)),
  );
};

/**
 * An award item in the shape the request's cost helpers price. Only the call
 * offering's own plan travels with the row, so an item pinned to another plan
 * is left unpriced rather than priced at the wrong one.
 */
export const asCostRow = (awarded: AwardedResource) => {
  const offering = awarded.requested_offering;
  return awarded.plan && awarded.plan !== offering.plan_details?.uuid
    ? { ...awarded, requested_offering: { ...offering, plan_details: null } }
    : awarded;
};

/** One option of an award line: its awarded value, and the requested one where
 * the two differ. */
export interface AwardOptionLine {
  key: string;
  label: string;
  value: string | null;
  /** Present only when the award answers the option differently. */
  requested?: string | null;
}

/**
 * The options an award line answers, in the offering's order, with what was
 * requested beside any the award changed. An item moved to another offering
 * has other options, so nothing is set against the request then.
 */
export const getAwardOptionLines = (
  row: AwardComparisonRow,
): AwardOptionLine[] => {
  const source = row.awarded ?? row.requested;
  const fields = (source?.requested_offering?.options as any)?.options;
  if (!fields) {
    return [];
  }
  const shown = new Map(
    getRequestOptionSummary(source).map((item) => [item.key, item.value]),
  );
  const changed = new Set(row.changedOptions ?? []);
  const requested = new Map(
    row.requested
      ? getRequestOptionSummary(row.requested).map((item) => [
          item.key,
          item.value,
        ])
      : [],
  );
  return optionKeys(source)
    .filter((key) => shown.has(key) || changed.has(key))
    .map((key) => ({
      key,
      label: fields[key]?.label || key,
      value: shown.get(key) ?? null,
      ...(changed.has(key) ? { requested: requested.get(key) ?? null } : {}),
    }));
};

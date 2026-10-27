import { DateTime } from 'luxon';
import { PolicyCostBreakdown, PolicyTriggerStatus } from 'waldur-js-client';

import { formatDate, formatMonth } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { CostPolicyType } from './types';
import { getCostPolicyActionOptions, policyPeriodOptions } from './utils';

/** The fields of an estimated-cost policy its details are built from. */
export interface CostPolicyDetailsPolicy {
  current_cost?: string | number | null;
  limit_cost?: number;
  period?: number;
  has_fired?: boolean;
  trigger_status?: PolicyTriggerStatus | null;
  cost_breakdown?: PolicyCostBreakdown | null;
}

const amount = (value: string | number | null | undefined) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** The policy's scope and action, for a dialog's subtitle. */
export const getPolicySubtitle = (policy: {
  scope_name?: string;
  actions?: string;
}) =>
  [
    policy.scope_name,
    getCostPolicyActionOptions().find(
      (option) => option.value === policy.actions,
    )?.label,
  ]
    .filter(Boolean)
    .join(' · ');

/** The figures the policy compares, as numbers. */
export interface CostPolicyFigures {
  /** The cost after credit, compared with the limit. */
  current: number;
  limit: number;
  beforeCredit: number;
  drawn: number;
  pending: number;
  /** The part of `current` from months before the current one. */
  earlier: number;
  /** The current month's part of `current`. */
  thisMonth: number;
  /** `current - limit`: positive when the policy is over its limit. */
  overBy: number;
}

export const getCostPolicyFigures = (
  policy: CostPolicyDetailsPolicy,
): CostPolicyFigures => {
  const current = amount(policy.current_cost);
  const limit = amount(policy.limit_cost);
  const breakdown = policy.cost_breakdown;
  const earlier = Math.max(0, amount(breakdown?.earlier_months));
  return {
    current,
    limit,
    beforeCredit: amount(breakdown?.cost_before_credit),
    drawn: amount(breakdown?.credit_drawn),
    pending: amount(breakdown?.credit_pending),
    earlier,
    thisMonth: Math.max(0, current - earlier),
    overBy: current - limit,
  };
};

/** Credit added now pays only the current month, so when the earlier months
 * alone are over the limit no top-up brings the policy below it. */
const isHeldByEarlierMonths = (figures: CostPolicyFigures) =>
  figures.earlier > figures.limit;

const PERIOD_MONTHS = {
  [policyPeriodOptions.oneMonth.value]: 1,
  [policyPeriodOptions.threeMonth.value]: 3,
  [policyPeriodOptions.twelveMonth.value]: 12,
};

/** Which months the policy counts, in words: "Total: every month since
 * November 2025, this one included", "3 months: August 2026 to October 2026".
 *
 * `firstMonth` is the project's first invoiced month, when known; a Total
 * period then names it.
 */
export const getPolicyPeriodText = (
  policy: CostPolicyDetailsPolicy,
  firstMonth?: string | null,
  today: DateTime = DateTime.now(),
): string => {
  const months = PERIOD_MONTHS[policy.period];
  if (!months) {
    return firstMonth
      ? translate('Total: every month since {month}, this one included.', {
          month: formatMonth(firstMonth),
        })
      : translate(
          'Total: every month since the project started, this one included.',
        );
  }
  const end = today.startOf('month');
  if (months === 1) {
    return translate('One month: {month} only.', {
      month: formatMonth(end.toISODate()),
    });
  }
  return translate('{count} months: {from} to {to}.', {
    count: months,
    from: formatMonth(end.minus({ months: months - 1 }).toISODate()),
    to: formatMonth(end.toISODate()),
  });
};

/** One sentence for the resource banner: why, and whether credit helps. The
 * details dialog says the rest. */
export const getCostPolicySummary = (
  policy: CostPolicyDetailsPolicy,
): string => {
  const figures = getCostPolicyFigures(policy);
  const values = {
    cost: defaultCurrency(figures.current),
    limit: defaultCurrency(figures.limit),
  };
  if (!policy.trigger_status?.triggered) {
    return translate(
      'The cost after credit is back at or below the limit, so its actions are reset at the next evaluation of the policy.',
    );
  }
  if (isHeldByEarlierMonths(figures)) {
    return translate(
      'The cost after credit, {cost}, is over the {limit} limit, and earlier months that credit did not cover keep it there: adding credit does not reset it.',
      values,
    );
  }
  return translate(
    'The cost after credit, {cost}, is over the {limit} limit.',
    values,
  );
};

/** A change that lowers the cost after credit, and whether that is enough to
 * reset the policy's actions. */
export interface ResetScenario {
  key: string;
  change: string;
  /** The cost after credit once the change is made; null when the change
   * does not work through the cost (raising the limit, a new period). */
  costAfter: number | null;
  resets: boolean;
  /** Why it does or does not reset the actions, when that is not obvious. */
  note?: string;
}

/** What would bring the policy back to its limit, one change per row, then
 * the two together when neither is enough alone.
 *
 * The policy resets its actions itself, at its next evaluation, once the cost
 * after credit is at or below the limit; each row says whether its change
 * gets the cost there. Empty for a policy at or below its limit.
 */
export const getResetScenarios = (
  policy: CostPolicyDetailsPolicy,
  today: DateTime = DateTime.now(),
): ResetScenario[] => {
  const f = getCostPolicyFigures(policy);
  if (!policy.trigger_status?.triggered) {
    return [];
  }
  const nextMonth = formatDate(today.plus({ months: 1 }).startOf('month'));
  const oneMonth = policy.period === policyPeriodOptions.oneMonth.value;
  const scenarios: ResetScenario[] = [];

  if (f.thisMonth > 0) {
    const needed = isHeldByEarlierMonths(f) ? f.thisMonth : f.overBy;
    const costAfter = f.current - needed;
    scenarios.push({
      key: 'credit',
      change: translate('Add {amount} of credit for this month', {
        amount: defaultCurrency(needed),
      }),
      costAfter,
      resets: costAfter <= f.limit,
      note: isHeldByEarlierMonths(f)
        ? translate(
            'Credit added now pays only this month, and the earlier months alone are over the limit.',
          )
        : undefined,
    });
  }
  if (f.earlier > 0) {
    scenarios.push({
      key: 'earlier',
      change: translate('Pay the earlier months, {earlier}', {
        earlier: defaultCurrency(f.earlier),
      }),
      costAfter: f.thisMonth,
      resets: f.thisMonth <= f.limit,
      note:
        f.thisMonth > f.limit
          ? translate('This month alone is over the limit.')
          : undefined,
    });
  }
  if (
    f.thisMonth > 0 &&
    f.earlier > 0 &&
    isHeldByEarlierMonths(f) &&
    f.thisMonth > f.limit
  ) {
    scenarios.push({
      key: 'both',
      change: translate(
        'Both: credit for this month and pay the earlier months',
      ),
      costAfter: 0,
      resets: true,
    });
  }
  scenarios.push({
    key: 'new_month',
    change: translate('The new month starts, on {date}', { date: nextMonth }),
    costAfter: oneMonth ? null : f.current,
    resets: oneMonth,
    note: oneMonth
      ? translate('Only the new month counts, from nothing.')
      : translate('The policy keeps counting earlier months.'),
  });
  scenarios.push({
    key: 'limit',
    change: translate('Raise the limit above {cost}', {
      cost: defaultCurrency(f.current),
    }),
    costAfter: null,
    resets: true,
  });
  return scenarios;
};

type FixOptionKey =
  'add_credit' | 'pay_earlier_invoices' | 'count_one_month' | 'edit_policy';

/** Who may take an option: organization owners and staff, or staff alone. */
type FixOptionAudience = 'owners' | 'staff';

/** An option for bringing a policy back to its limit, and its impact. */
export interface FixOption {
  key: FixOptionKey;
  title: string;
  description: string;
  audience: FixOptionAudience;
  /** Whether this user may take it. */
  allowed: boolean;
  /** The cost after credit once it is taken; null when it works through the
   * limit rather than the cost. */
  costAfter: number | null;
  resets: boolean;
}

interface FixContext {
  type: CostPolicyType;
  isStaff: boolean;
  /** Owner of the policy's organization, or staff. */
  isOwnerOrStaff: boolean;
  /** The project's credit, when it has one. */
  credit?: { pay_earlier_invoices?: boolean } | null;
  /** What paying earlier invoices would pay now, when known. */
  payableNow?: number | null;
}

/** Who may change the policy or its project's credit: owners and staff for a
 * project policy, staff alone for an organization's. */
export const canFixCostPolicy = (
  type: CostPolicyType,
  isStaff: boolean,
  isOwnerOrStaff: boolean,
) => (type === 'project' ? isOwnerOrStaff : isStaff);

/** The options for bringing a policy over its limit back to it, with the
 * cost after credit each leaves. Empty for a policy at or below its limit. */
export const getFixOptions = (
  policy: CostPolicyDetailsPolicy,
  context: FixContext,
): FixOption[] => {
  const f = getCostPolicyFigures(policy);
  if (!policy.trigger_status?.triggered || f.overBy <= 0) {
    return [];
  }
  const isProject = context.type === 'project';
  const policyAudience: FixOptionAudience = isProject ? 'owners' : 'staff';
  const canEditPolicy = canFixCostPolicy(
    context.type,
    context.isStaff,
    context.isOwnerOrStaff,
  );
  const options: FixOption[] = [];

  if (isProject && context.credit && f.thisMonth > 0) {
    const needed = isHeldByEarlierMonths(f) ? f.thisMonth : f.overBy;
    const costAfter = f.current - needed;
    options.push({
      key: 'add_credit',
      title: translate('Add project credit'),
      description: translate(
        "Raise the project's allocation by {amount}. Credit added now pays only this month's cost, up to {thisMonth}.",
        {
          amount: defaultCurrency(needed),
          thisMonth: defaultCurrency(f.thisMonth),
        },
      ),
      audience: 'owners',
      allowed: context.isOwnerOrStaff,
      costAfter,
      resets: costAfter <= f.limit,
    });
  }

  if (
    isProject &&
    context.credit &&
    f.earlier > 0 &&
    !context.credit.pay_earlier_invoices
  ) {
    const payable = Math.min(f.earlier, Math.max(0, context.payableNow ?? 0));
    const costAfter = f.current - payable;
    options.push({
      key: 'pay_earlier_invoices',
      title: translate('Pay earlier invoices from the project credit'),
      description:
        payable > 0
          ? translate(
              'The project credit pays the {earlier} of earlier months that no credit covered: {payable} now, from the credit left, and the rest as credit becomes available. Payments are not undone when this is turned off.',
              {
                earlier: defaultCurrency(f.earlier),
                payable: defaultCurrency(payable),
              },
            )
          : translate(
              "The project credit pays the {earlier} of earlier months that no credit covered as credit becomes available. This month's cost uses all of the credit left now, so nothing is paid today.",
              { earlier: defaultCurrency(f.earlier) },
            ),
      audience: 'staff',
      allowed: context.isStaff,
      costAfter,
      resets: costAfter <= f.limit,
    });
  }

  if (policy.period !== policyPeriodOptions.oneMonth.value && f.earlier > 0) {
    options.push({
      key: 'count_one_month',
      title: translate('Count only the current month'),
      description: translate(
        'Change the period to one month. Earlier months then stop counting, paid or not.',
      ),
      audience: policyAudience,
      allowed: canEditPolicy,
      costAfter: f.thisMonth,
      resets: f.thisMonth <= f.limit,
    });
  }

  options.push({
    key: 'edit_policy',
    title: translate('Raise the limit'),
    description: translate(
      'Set a limit above {cost}, or change what the policy does.',
      { cost: defaultCurrency(f.current) },
    ),
    audience: policyAudience,
    allowed: canEditPolicy,
    costAfter: null,
    resets: true,
  });
  return options;
};

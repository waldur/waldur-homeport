import { PolicyGateEnum, PolicyTriggerStatus } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

/** The fields of an estimated-cost policy the status is worded from. */
export interface TriggerStatusPolicy {
  trigger_status?: PolicyTriggerStatus | null;
  has_fired?: boolean;
  current_cost?: string | number | null;
  limit_cost?: number;
}

export interface TriggerStatusView {
  /** Short text for the badge in a list cell. */
  label: string;
  /** The figures behind a waiting policy, shown under the badge. */
  detail?: string;
  /** The full reason, for the badge's tooltip. */
  explanation: string;
  /** What happens next, shown after the reason in the tooltip. */
  note?: string;
  variant: BadgeVariant;
  /** The policy is over its limit but its actions have not run yet. */
  pending: boolean;
  /** Cost is over the limit, but a credit balance still holds the policy. */
  held: boolean;
}

const HELD_GATES: PolicyGateEnum[] = [
  'held_by_project_credit',
  'held_by_customer_credit',
];

/** Cost is over the limit, but a credit balance still holds the policy. */
export const isHeldGate = (gate: PolicyGateEnum | null | undefined) =>
  Boolean(gate) && HELD_GATES.includes(gate);

/** Why the policy fires or not, worded for people.
 *
 * Built only from `trigger_status`, the policy's own evaluation on the server;
 * the gate is never re-derived from the credit fields. `credit_value_compared`
 * is null when the credit was not checked, and also when the balance is the
 * organization's and the user may not see it, so every sentence that names a
 * balance has a variant without it. Returns null for an older backend that
 * does not send `trigger_status`.
 */
export const getTriggerStatusView = (
  policy: TriggerStatusPolicy,
): TriggerStatusView | null => {
  const status = policy.trigger_status;
  if (!status) {
    return null;
  }
  const cost = defaultCurrency(policy.current_cost ?? 0);
  const limit = defaultCurrency(policy.limit_cost ?? 0);
  const credit =
    status.credit_value_compared !== null &&
    status.credit_value_compared !== undefined
      ? defaultCurrency(status.credit_value_compared)
      : null;
  const held = isHeldGate(status.gate);

  const reason = getGateReason(status.gate, cost, limit, credit);
  if (!reason) {
    // A gate this client does not know: no status rather than a wrong one.
    return null;
  }

  if (status.triggered) {
    if (policy.has_fired) {
      return {
        label: translate('Limit reached'),
        explanation: reason,
        variant: 'danger',
        pending: false,
        held,
      };
    }
    return {
      label: translate('Limit reached, actions pending'),
      explanation: reason,
      note: translate('Its actions run at the next evaluation of the policy.'),
      variant: 'warning',
      pending: true,
      held,
    };
  }

  if (policy.has_fired) {
    // Fired earlier, no longer over: the next evaluation resets its actions.
    return {
      label: translate('Resets at next evaluation'),
      explanation: reason,
      note: translate(
        'The actions it ran are undone at the next evaluation of the policy.',
      ),
      variant: 'info',
      pending: false,
      held,
    };
  }

  if (held) {
    return {
      label:
        status.gate === 'held_by_project_credit'
          ? translate('Waiting for project credit')
          : translate('Waiting for organization credit'),
      detail: credit
        ? translate('{credit} left, limit {limit}', { credit, limit })
        : translate('Credit left is above the limit {limit}', { limit }),
      explanation: reason,
      variant: 'warning',
      pending: false,
      held,
    };
  }
  return {
    label: translate('Below limit'),
    explanation: reason,
    variant: 'success',
    pending: false,
    held,
  };
};

/** How much above `limit_cost` the credit left may be for a held policy to
 * count as about to fire. */
const CLOSE_TO_LIMIT = 1.2;

/** The dashboard's warning about the project's cost policies, if any.
 *
 * `pending`: a policy is over its limit and its actions have not run yet.
 * `soon`: a policy is held by credit whose live balance is within 20 % of the
 * limit, so it fires once a little more is used. Both come from the policies'
 * own evaluation; a held policy whose balance is withheld from the user cannot
 * be judged close, and gives no warning.
 */
export const getCostPolicyWarning = (
  policies: TriggerStatusPolicy[] | undefined,
): 'pending' | 'soon' | null => {
  if (!policies?.length) {
    return null;
  }
  if (policies.some((p) => p.trigger_status?.triggered && !p.has_fired)) {
    return 'pending';
  }
  const close = policies.some((p) => {
    const status = p.trigger_status;
    if (
      !status ||
      status.triggered ||
      p.has_fired ||
      !isHeldGate(status.gate) ||
      status.credit_value_compared === null ||
      status.credit_value_compared === undefined
    ) {
      return false;
    }
    return (
      Number(status.credit_value_compared) <=
      (p.limit_cost ?? 0) * CLOSE_TO_LIMIT
    );
  });
  return close ? 'soon' : null;
};

const getGateReason = (
  gate: PolicyGateEnum,
  cost: string,
  limit: string,
  credit: string | null,
): string => {
  switch (gate) {
    case 'cost_below_limit':
      return translate(
        'The cost after credit, {cost}, is at or below the limit, {limit}.',
        { cost, limit },
      );
    case 'held_by_project_credit':
      return credit
        ? translate(
            'The cost after credit, {cost}, is over the limit, {limit}, but the project credit left, {credit}, is above it. The policy fires once that credit falls to the limit.',
            { cost, limit, credit },
          )
        : translate(
            'The cost after credit, {cost}, is over the limit, {limit}, but the project credit left is above it. The policy fires once that credit falls to the limit.',
            { cost, limit },
          );
    case 'held_by_customer_credit':
      return credit
        ? translate(
            'The cost after credit, {cost}, is over the limit, {limit}, but the organization credit left, {credit}, is above it. The policy fires once that credit falls to the limit.',
            { cost, limit, credit },
          )
        : translate(
            'The cost after credit, {cost}, is over the limit, {limit}, but the organization credit left is above it. The policy fires once that credit falls to the limit.',
            { cost, limit },
          );
    case 'credit_exhausted':
      return credit
        ? translate(
            'The cost after credit, {cost}, is over the limit, {limit}, and the credit left, {credit}, is at or below it.',
            { cost, limit, credit },
          )
        : translate(
            'The cost after credit, {cost}, is over the limit, {limit}, and the credit left is at or below it.',
            { cost, limit },
          );
    case 'no_credit':
      return translate(
        'The cost, {cost}, is over the limit, {limit}, and there is no credit.',
        { cost, limit },
      );
    case 'credit_ignored':
      return translate(
        'The cost, {cost}, is over the limit, {limit}; this policy does not take credit into account.',
        { cost, limit },
      );
    default:
      return '';
  }
};

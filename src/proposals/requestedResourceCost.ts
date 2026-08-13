import { PublicOfferingDetails } from 'waldur-js-client';

import { filterOfferingComponents } from '@/marketplace/common/registry';
import { getBillingPeriods } from '@/marketplace/common/utils';
import { combinePrices } from '@/marketplace/details/plan/utils';

/**
 * What a requested resource is expected to cost once it is provisioned.
 *
 * `monthly` is normalised to a month so rows priced in different plan units
 * (hourly, daily, monthly) can be added up; the deploy checkout normalises the
 * same way. `oneTime` is charged once at creation and so is kept apart rather
 * than folded into a recurring figure.
 */
export interface RequestedResourceCost {
  monthly: number;
  oneTime: number;
  /**
   * False when no priced plan was available. Distinct from a cost of zero:
   * rendering an unknown estimate as "0.00" would read as "free".
   */
  known: boolean;
}

const EMPTY_COST: RequestedResourceCost = {
  monthly: 0,
  oneTime: 0,
  known: false,
};

/** Shape of the requested offering carried on a proposal resource row. */
interface RequestedOfferingLike {
  offering_type?: string;
  components?: unknown;
  plan_details?: unknown;
}

interface RequestedResourceLike {
  requested_offering?: RequestedOfferingLike;
  limits?: Record<string, number> | null;
  attributes?: Record<string, unknown> | null;
}

/**
 * Whether the request names an amount for anything the offering lets you ask for.
 *
 * Shared by the cost estimate and the proposal's completion check so the two
 * cannot drift: the same emptiness that renders as "unset" is the emptiness
 * that stops the step counting as done, and that
 * `validate_requested_amounts_present` refuses at submission.
 *
 * An offering with nothing requestable is vacuously satisfied — there is no
 * amount to name.
 */
interface ComponentLike {
  type?: string;
  billing_type?: string;
  is_prepaid?: boolean;
}

const namesAnyAmount = (
  components: ComponentLike[],
  limits: Record<string, number> | null | undefined,
) => {
  const requestable = components.filter(
    (component) =>
      component.billing_type === 'limit' ||
      (component.billing_type === 'one' && component.is_prepaid),
  );
  if (!requestable.length) {
    return true;
  }
  return requestable.some(
    (component) => Number((limits || {})[component.type as string]) > 0,
  );
};

/** Row-level form of the same rule, for the proposal's completion check. */
export const hasRequestedAmount = (row: RequestedResourceLike): boolean => {
  const requestedOffering = row?.requested_offering;
  const limits =
    row?.limits && Object.keys(row.limits).length
      ? row.limits
      : ((row?.attributes?.limits as Record<string, number>) ?? {});
  return namesAnyAmount(
    filterOfferingComponents({
      type: requestedOffering?.offering_type,
      components: (requestedOffering?.components as any) || [],
    } as Pick<PublicOfferingDetails, 'type' | 'components'>) as any,
    limits,
  );
};

/**
 * Cost of one plan at one set of limits.
 *
 * Takes the offering because several plugins filter their component list by
 * type, and pricing the components they hide would overstate the estimate.
 */
export const computeRequestedCost = (
  plan: any,
  limits: Record<string, number> | null | undefined,
  offering: { type?: string; components?: unknown } | undefined,
  /**
   * End of the requested subscription period, as the configure step stored it.
   * Prepaid components are bought per month and charged for the whole period,
   * so without it a six-month request is priced as one month — and the figure
   * here contradicts the one the applicant just saw while choosing.
   */
  endDate?: string | null,
): RequestedResourceCost => {
  if (!plan) {
    // A call may accept an offering without pinning a plan; there is then no
    // price list to estimate from.
    return EMPTY_COST;
  }
  const prices = combinePrices(
    plan,
    limits || {},
    {},
    {
      type: offering?.type,
      components: (offering?.components as any) || [],
    } as Pick<PublicOfferingDetails, 'type' | 'components'>,
    endDate || undefined,
  );
  if (!prices.components.length) {
    return EMPTY_COST;
  }

  // A request that asks for an offering but names no amount is not free — it is
  // unfinished. Attaching an offering to a proposal creates exactly that row,
  // and rendering it as "0.00" made an empty request look like a priced one.
  // Unknown is the honest answer until the applicant fills the amounts in.
  if (!namesAnyAmount(prices.components, limits)) {
    return EMPTY_COST;
  }

  const { periodKeys, multipliers } = getBillingPeriods(plan.unit);
  // Plans billed for consumption have no monthly period at all; index 0 is then
  // the only figure there is.
  const monthlyIndex = Math.max(periodKeys.indexOf('monthly'), 0);
  const monthlyMultiplier = multipliers[monthlyIndex] || 1;

  // A limit with no period, or period "total", is an allocation for the whole
  // lifetime — charged once, exactly as the plan-components table files it
  // under "One time cost". Calling a grant's whole core-hour award a monthly
  // figure would overstate it by the number of months it runs for.
  const isOneTime = (component: {
    billing_type?: string;
    limit_period?: string;
  }) =>
    component.billing_type === 'one' ||
    (component.billing_type === 'limit' &&
      (!component.limit_period || component.limit_period === 'total'));

  let monthly = 0;
  let oneTime = 0;
  for (const component of prices.components) {
    const subTotal = component.subTotal || 0;
    if (isOneTime(component)) {
      oneTime += subTotal;
    } else if (component.billing_type !== 'usage') {
      // Usage is metered after the fact, so it has no requested amount to price.
      monthly += subTotal * monthlyMultiplier;
    }
  }

  return { monthly, oneTime, known: true };
};

export const getRequestedResourceCost = (
  row: RequestedResourceLike,
): RequestedResourceCost => {
  const requestedOffering = row?.requested_offering;
  // Legacy rows carry the amounts inside attributes; see the migration that
  // lifted them into `limits`.
  const limits =
    row?.limits && Object.keys(row.limits).length
      ? row.limits
      : ((row?.attributes?.limits as Record<string, number>) ?? {});
  return computeRequestedCost(
    requestedOffering?.plan_details,
    limits,
    {
      type: requestedOffering?.offering_type,
      components: requestedOffering?.components,
    },
    row?.attributes?.end_date as string | undefined,
  );
};

/** Adds up rows, staying "unknown" only when not a single row could be priced. */
export const sumRequestedResourceCosts = (
  rows: RequestedResourceLike[],
): RequestedResourceCost =>
  rows.map(getRequestedResourceCost).reduce<RequestedResourceCost>(
    (total, cost) => ({
      monthly: total.monthly + cost.monthly,
      oneTime: total.oneTime + cost.oneTime,
      known: total.known || cost.known,
    }),
    EMPTY_COST,
  );

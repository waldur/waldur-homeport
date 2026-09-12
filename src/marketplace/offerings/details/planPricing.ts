import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { getBillingPeriods } from '@/marketplace/common/utils';
import { Component } from '@/marketplace/details/plan/types';
import { combinePrices } from '@/marketplace/details/plan/utils';

export interface PlanPricing {
  plan: BasePublicPlan;
  components: Component[];
  /** Converts a figure denominated in the plan's billing unit to a monthly one. */
  monthlyMultiplier: number;
  /** False for `quantity` and `quarter` plans, which have no monthly figure. */
  isMonthly: boolean;
  /** Recurring cost of everything the plan already fixes, per month when `isMonthly`. */
  monthlyBase: number;
  /** The word `monthlyBase` is denominated in — "month" unless the plan is not periodic. */
  periodLabel: string;
  /** Charged once at order time, whatever the customer sizes. */
  oneTime: number;
  /** The final bill also depends on quantities the customer picks, or on metered usage. */
  hasVariableCost: boolean;
}

const NO_QUANTITIES = {};

const UNIT_LABELS: Record<string, string> = {
  month: translate('month'),
  quarter: translate('quarter'),
  half_month: translate('half-month'),
  day: translate('day'),
  hour: translate('hour'),
  quantity: translate('unit'),
};

/**
 * Prices a plan as a catalogue entry rather than as an order: nothing has been
 * configured yet, so components the customer sizes themselves contribute no
 * quantity and the recurring figure is the floor paid before sizing anything.
 */
export const getPlanPricing = (
  offering: Pick<PublicOfferingDetails, 'type' | 'components'>,
  plan: BasePublicPlan,
): PlanPricing => {
  const { components } = combinePrices(
    plan,
    NO_QUANTITIES,
    NO_QUANTITIES,
    offering,
  );
  const { periodKeys, multipliers } = getBillingPeriods(plan.unit);
  // `quantity` and `quarter` units fall through getBillingPeriods' default,
  // which offers no monthly period — such a plan has no per-month figure to
  // quote and must not be labelled with one.
  const monthlyIndex = periodKeys.indexOf('monthly');
  const isMonthly = monthlyIndex !== -1;
  const monthlyMultiplier = isMonthly ? multipliers[monthlyIndex] : 1;

  // Deliberately not combinePrices' `total`: that folds prepaid one-off
  // charges into the subscription subtotal, which would both inflate the
  // recurring figure and double-count against `oneTime` below. The recurring
  // floor is the fixed components alone — limit components contribute no
  // quantity until the customer sizes them.
  const recurring = components
    .filter((component) => component.billing_type === 'fixed')
    .reduce((sum, component) => sum + component.subTotal, 0);

  // Prepaid components are one-off but customer-sized; combinePrices assumes a
  // quantity of 1 for them here, which is not a figure worth quoting as fact.
  const oneTime = components
    .filter(
      (component) =>
        component.billing_type === 'one' && component.is_prepaid !== true,
    )
    .reduce((sum, component) => sum + component.subTotal, 0);

  const hasVariableCost = components.some(
    (component) =>
      component.price > 0 &&
      (component.billing_type === 'limit' ||
        component.billing_type === 'usage' ||
        component.is_prepaid === true),
  );

  return {
    plan,
    components,
    monthlyMultiplier,
    isMonthly,
    periodLabel: isMonthly
      ? UNIT_LABELS.month
      : (UNIT_LABELS[plan.unit] ?? UNIT_LABELS.quantity),
    monthlyBase: recurring * monthlyMultiplier,
    oneTime,
    hasVariableCost,
  };
};

/**
 * The plans a visitor could actually order. The public serializer returns
 * archived plans on purpose, but the deploy flow filters them out, so quoting
 * one would advertise a price nobody can buy.
 */
export const getOrderablePlans = (
  offering: Pick<PublicOfferingDetails, 'plans'>,
): BasePublicPlan[] => (offering.plans ?? []).filter((plan) => !plan.archived);

/** The cheapest recurring entry point across an offering's orderable plans. */
export const getOfferingEntryPrice = (
  offering: Pick<PublicOfferingDetails, 'type' | 'components' | 'plans'>,
): PlanPricing | null => {
  const plans = getOrderablePlans(offering);
  if (!plans.length) {
    return null;
  }
  const pricings = plans.map((plan) => getPlanPricing(offering, plan));
  // Figures in different denominations are not comparable — a "per unit" plan
  // would undercut a monthly one on the raw number alone. Compare periodic
  // plans against each other, and fall back only when there are none.
  const periodic = pricings.filter((pricing) => pricing.isMonthly);
  const comparable = periodic.length ? periodic : pricings;
  return comparable.reduce((cheapest, pricing) =>
    pricing.monthlyBase < cheapest.monthlyBase ? pricing : cheapest,
  );
};

/**
 * True when any orderable plan bills beyond its fixed part, so the headline
 * figure is a floor rather than the whole price.
 */
export const hasVariablePricing = (
  offering: Pick<PublicOfferingDetails, 'type' | 'components' | 'plans'>,
): boolean =>
  getOrderablePlans(offering).some(
    (plan) => getPlanPricing(offering, plan).hasVariableCost,
  );

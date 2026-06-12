import { DateTime } from 'luxon';
import {
  BasePublicPlan,
  LimitPeriodEnum,
  marketplacePublicOfferingsPlansRetrieve,
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesRetrieve,
  Offering,
  projectsRetrieve,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import {
  filterOfferingComponents,
  getFormLimitParser,
  getFormLimitSerializer,
} from '@/marketplace/common/registry';
import { LimitParser, Limits } from '@/marketplace/common/types';
import { getBillingPeriods } from '@/marketplace/common/utils';
import { parseOfferingLimits } from '@/marketplace/offerings/store/limits';
import { OfferingLimits } from '@/marketplace/offerings/store/types';

/**
 * How a component's price is billed for the customer.
 * - `month` / `quarterly` / `annual`: recurring per period, charged at each period boundary.
 * - `total`: one-time charge for the whole resource lifetime; on limit changes only the delta is billed.
 * - `prepaid`: paid up-front for a duration; on limit changes the customer pays for the remaining months.
 */
type ChargeMode = 'month' | 'quarterly' | 'annual' | 'total' | 'prepaid';

export interface ComponentRowType {
  type: string;
  name: string;
  measured_unit: string;
  is_boolean: boolean;
  limit: number;
  usage: number;
  /** Price for the relevant billing period at the new limit. */
  price: number;
  /** Difference vs. current limit, expressed in the same period. */
  changedPrice: number;
  subTotal: number;
  changedSubTotal: number;
  changedLimit: number;
  /** How the component is billed; drives the column suffix and the totals grouping. */
  chargeMode: ChargeMode;
  /** Localized suffix appended to the formatted price, e.g. "/mo", " /year", " one-time". */
  priceSuffix: string;
}

export interface PeriodTotalRow {
  chargeMode: ChargeMode;
  label: string;
  total: number;
  changedTotal: number;
  priceSuffix: string;
}

export interface StateProps {
  components: ComponentRowType[];
  periodTotals: PeriodTotalRow[];
  orderCanBeApproved: boolean;
  shouldConcealPrices?: boolean;
  offering?: PublicOfferingDetails | Offering;
  newLimits?: Limits;
}

export interface FetchedData {
  resource: Resource;
  offering: PublicOfferingDetails;
  plan: BasePublicPlan;
  limitSerializer: LimitParser;
  usages: Limits;
  limits: Limits;
  initialValues: { limits: Limits };
  offeringLimits: OfferingLimits;
  concealBillingInfo: boolean;
}

/**
 * Whether an offering exposes components whose limits a customer can change:
 * limit-based components or prepaid components.
 */
export const hasEditableLimitComponents = (offering?: {
  components?: ReadonlyArray<{ billing_type?: string; is_prepaid?: boolean }>;
}): boolean =>
  Boolean(
    offering?.components?.some(
      (c) => c.billing_type === 'limit' || c.is_prepaid,
    ),
  );

export const getRemainingMonths = (endDate: string): number => {
  const now = DateTime.now();
  const end = DateTime.fromISO(endDate);
  return Math.max(0, Math.ceil(end.diff(now, 'months').months));
};

export const getLimitChangeRequirements = (
  resource: Pick<Resource, 'limits' | 'current_usages'>,
  offering: PublicOfferingDetails | Offering,
) => {
  const limitParser = getFormLimitParser(offering.type);
  const limitSerializer = getFormLimitSerializer(offering.type);
  const components = filterOfferingComponents(offering).filter(
    (component) => component.billing_type === 'limit' || component.is_prepaid,
  );
  const usages = limitParser(resource.current_usages || {});
  const resourceLimits = limitParser(resource.limits);
  const limits: Record<string, number> = Object.fromEntries(
    components.map((component) => [
      component.type,
      resourceLimits[component.type] || 0,
    ]),
  );
  const offeringLimits = parseOfferingLimits(offering);
  return {
    limitSerializer,
    usages,
    limits,
    offeringLimits,
  };
};

export async function loadData(resource_uuid): Promise<FetchedData> {
  const resource = (
    await marketplaceResourcesRetrieve({
      path: { uuid: resource_uuid },
    })
  ).data;
  const offering = (
    await marketplaceResourcesOfferingRetrieve({
      path: { uuid: resource_uuid },
    })
  ).data;

  let plan: BasePublicPlan;
  try {
    const response = await marketplacePublicOfferingsPlansRetrieve({
      path: { uuid: resource.offering_uuid, plan_uuid: resource.plan_uuid },
    });
    plan = response.data;
  } catch {
    plan = offering.plans.find((p) => p.uuid === resource.plan_uuid);
  }
  if (!plan) {
    throw Error(`Plan with uuid of ${resource.plan_uuid} does not exist.`);
  }

  const { limitSerializer, usages, limits, offeringLimits } =
    getLimitChangeRequirements(resource, offering);

  let concealBillingInfo = false;
  if (resource.project_uuid) {
    try {
      const project = (
        await projectsRetrieve({
          path: { uuid: resource.project_uuid },
          query: { field: ['customer_display_billing_info_in_projects'] },
        })
      ).data;
      concealBillingInfo =
        project?.customer_display_billing_info_in_projects === false;
    } catch {
      // If we can't fetch the project, don't conceal prices
    }
  }

  return {
    resource,
    offering,
    plan,
    limitSerializer,
    usages,
    limits,
    offeringLimits,
    initialValues: { limits },
    concealBillingInfo,
  };
}

/**
 * Period suffix appended to a formatted currency value, e.g. "$10 /mo".
 * Mirrors the convention used in OrderSummaryPlanRows so customers see the same
 * billing-cycle labels in the order summary and in the change-limits view.
 */
const getPriceSuffix = (chargeMode: ChargeMode): string => {
  switch (chargeMode) {
    case 'month':
      return translate(' /mo');
    case 'quarterly':
      return translate(' /quarter');
    case 'annual':
      return translate(' /year');
    case 'total':
      return translate(' one-time');
    case 'prepaid':
      return '';
  }
};

/** Per-group label used in the totals footer of the change-limits table. */
const getPeriodTotalLabel = (
  chargeMode: ChargeMode,
  remainingMonths?: number,
): string => {
  switch (chargeMode) {
    case 'month':
      return translate('Monthly total');
    case 'quarterly':
      return translate('Quarterly total');
    case 'annual':
      return translate('Annual total');
    case 'total':
      return translate('One-time total');
    case 'prepaid':
      return remainingMonths !== undefined && remainingMonths <= 0
        ? translate('Prepaid period expired')
        : translate('Total for remaining {count} months', {
            count: remainingMonths ?? 0,
          });
  }
};

/**
 * Pick the right multiplier from the plan_unit-derived array of periods so that
 * subTotal × multiplier matches the customer's actual billing cycle.
 *
 * `subTotal = plan.prices[component.type] × limit` is denominated in plan_unit
 * (per day for plan.unit='day', per month for plan.unit='month', etc.). To bill
 * monthly we need to scale by 30 for day-plans, by 1 for month-plans, etc.
 *
 * For `quarterly`/`total` there is no key in the existing periods table, so we
 * derive them from the monthly multiplier (3×) and 1× respectively. This matches
 * the convention used by OrderSummaryPlanRows for the order summary.
 */
const getPeriodMultiplier = (
  chargeMode: ChargeMode,
  periodKeys: string[],
  multipliers: number[],
): number => {
  if (chargeMode === 'total') return 1;
  const monthlyIdx = periodKeys.indexOf('monthly');
  const monthlyMult = monthlyIdx >= 0 ? multipliers[monthlyIdx] : 1;
  if (chargeMode === 'quarterly') return monthlyMult * 3;
  const targetKey = chargeMode === 'month' ? 'monthly' : chargeMode; // 'annual'
  const idx = periodKeys.indexOf(targetKey);
  return idx >= 0 ? multipliers[idx] : monthlyMult;
};

const resolveChargeMode = (component: {
  is_prepaid?: boolean;
  limit_period?: LimitPeriodEnum | string | null;
}): ChargeMode => {
  if (component.is_prepaid) return 'prepaid';
  switch (component.limit_period) {
    case 'month':
    case 'quarterly':
    case 'annual':
    case 'total':
      return component.limit_period;
    default:
      // No explicit limit_period — default to monthly billing, the most common case.
      return 'month';
  }
};

export const getLimitChangeData = (
  plan,
  offering,
  newLimits,
  currentLimits,
  usages,
  orderCanBeApproved,
  concealBillingInfo = false,
  resourceEndDate?: string,
): StateProps => {
  const { multipliers, periodKeys } = getBillingPeriods(plan.unit);
  const offeringComponents = filterOfferingComponents(offering).filter(
    (component) => component.billing_type === 'limit' || component.is_prepaid,
  );

  const remainingMonths = resourceEndDate
    ? getRemainingMonths(resourceEndDate)
    : undefined;

  const components: ComponentRowType[] = offeringComponents.map((component) => {
    const chargeMode = resolveChargeMode(component);
    const price = plan.prices[component.type] || 0;
    const newLimit = newLimits[component.type] || 0;
    const currentLimit = currentLimits[component.type] || 0;
    const subTotal = price * newLimit;
    const changedLimit = newLimit - currentLimit;
    const changedSubTotal = price * changedLimit;

    const periodMultiplier =
      chargeMode === 'prepaid'
        ? (remainingMonths ?? 0)
        : getPeriodMultiplier(chargeMode, periodKeys, multipliers);

    const periodPrice = periodMultiplier * subTotal;
    const periodChangedPrice = periodMultiplier * changedSubTotal;

    return {
      type: component.type,
      name: component.name,
      measured_unit: component.measured_unit,
      is_boolean: component.is_boolean,
      usage: usages[component.type] || 0,
      limit: currentLimits[component.type],
      subTotal,
      changedSubTotal,
      changedLimit,
      chargeMode,
      price: periodPrice,
      changedPrice: periodChangedPrice,
      priceSuffix:
        chargeMode === 'prepaid'
          ? remainingMonths !== undefined && remainingMonths > 0
            ? translate(' for remaining {count} months', {
                count: remainingMonths,
              })
            : ''
          : getPriceSuffix(chargeMode),
    };
  });

  // Group totals by chargeMode so a mixed offering (e.g. monthly + total)
  // does not collapse periods that are not commensurable.
  const periodTotalsMap = new Map<
    ChargeMode,
    {
      total: number;
      changedTotal: number;
    }
  >();
  for (const row of components) {
    const acc = periodTotalsMap.get(row.chargeMode) ?? {
      total: 0,
      changedTotal: 0,
    };
    acc.total += row.price;
    acc.changedTotal += row.changedPrice;
    periodTotalsMap.set(row.chargeMode, acc);
  }
  const periodTotals: PeriodTotalRow[] = Array.from(
    periodTotalsMap.entries(),
  ).map(([chargeMode, { total, changedTotal }]) => ({
    chargeMode,
    label: getPeriodTotalLabel(chargeMode, remainingMonths),
    total,
    changedTotal,
    priceSuffix: chargeMode === 'prepaid' ? '' : getPriceSuffix(chargeMode),
  }));

  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) || concealBillingInfo;
  return {
    components,
    periodTotals,
    orderCanBeApproved,
    offering,
    shouldConcealPrices,
    newLimits,
  };
};

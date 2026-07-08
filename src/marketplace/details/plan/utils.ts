import { sumBy } from 'lodash-es';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  BasePublicPlan,
  LimitPeriodEnum,
  PublicOfferingDetails,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { calculateMonthsDifference } from '@/core/dateUtils';
import { formatCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import {
  filterOfferingComponents,
  getFormLimitParser,
} from '@/marketplace/common/registry';
import { getBillingPeriods } from '@/marketplace/common/utils';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { Limits } from '@/marketplace/details/types';
import { parseOfferingLimits } from '@/marketplace/offerings/store/limits';
import {
  evaluateTiers,
  parseFormulaToTiers,
} from '@/marketplace/offerings/update/plans/discountFormula';

import { Component, PricesData } from './types';

export const combinePrices = (
  plan: BasePublicPlan,
  limits: Limits,
  usages: Limits,
  offering: Pick<PublicOfferingDetails, 'type' | 'components'>,
  end_date?: string,
  start_date?: string,
): PricesData => {
  if (plan && offering) {
    const { periods, multipliers, periodKeys } = getBillingPeriods(plan.unit);
    const offeringLimits = parseOfferingLimits(offering);
    const offeringComponents = filterOfferingComponents(offering);

    // Calculate the duration multiplier based on the end_date
    const effectiveStartDate = start_date || DateTime.now().toISODate();
    const durationInMonths = calculateMonthsDifference(
      effectiveStartDate,
      end_date,
    );

    const components: Component[] = offeringComponents.map((component) => {
      let amount = 0;
      let displayAmount: number | undefined;
      if (
        component.billing_type === 'limit' &&
        limits &&
        limits[component.type]
      ) {
        amount = limits[component.type];
      } else if (
        component.billing_type === 'usage' &&
        usages &&
        usages[component.type]
      ) {
        amount = usages[component.type] || 0;
      } else if (
        component.billing_type === 'fixed' &&
        plan.quotas &&
        plan.quotas[component.type]
      ) {
        amount = plan.quotas[component.type] || 0;
      } else if (
        component.billing_type === 'one' ||
        component.billing_type === 'few'
      ) {
        // If the one-time component is prepaid, take its value from limits.
        if (component.is_prepaid && limits && limits[component.type]) {
          amount = limits[component.type];
          displayAmount = amount;
          if (durationInMonths) {
            amount *= durationInMonths;
          }
        } else {
          // For non-prepaid one-time components, use plan quotas if available.
          // Use != null to properly handle quota value of 0
          amount =
            plan.quotas && plan.quotas[component.type] != null
              ? plan.quotas[component.type]
              : 1;
        }
      }
      const price = Number(plan.prices[component.type]) || 0;
      // The price from the plan component is always per billing unit
      // (per the plan's unit field: hour, day, month, etc.).
      // The limit_period only defines how limits are evaluated/reset,
      // not how prices are denominated.
      const rawSubTotal = price * amount;

      // Volume discounts are configured per plan component. A discount can be
      // previewed live only when its scope is per-resource (otherwise it
      // depends on the customer's other resources) and its billed quantity is
      // known at order time (every billing type except usage-based, which is
      // metered later) and its formula is tier-shaped (client-evaluable).
      // Every other case is applied at invoice finalization.
      const planComponent = plan.components?.find(
        (pc) => pc.type === component.type,
      );
      const discountFormula = (planComponent?.discount_formula || '').trim();

      let discountApplied = false;
      let discountAmount = 0;
      let discountPercent = 0;
      let discountDeferred = false;

      if (discountFormula) {
        const tiers = parseFormulaToTiers(discountFormula);
        const previewable =
          planComponent?.discount_aggregation === 'resource' &&
          component.billing_type !== 'usage' &&
          tiers !== null &&
          tiers.length > 0;
        if (previewable) {
          const percent = evaluateTiers(tiers, amount);
          if (percent > 0) {
            discountApplied = true;
            discountPercent = percent;
            discountAmount = (rawSubTotal * percent) / 100;
          }
        } else {
          discountDeferred = true;
        }
      }

      const subTotal = rawSubTotal - discountAmount;
      const prices = multipliers.map((mult) => mult * subTotal);

      return {
        ...component,
        amount,
        displayAmount,
        durationInMonths: displayAmount != null ? durationInMonths : undefined,
        prices,
        subTotal,
        price,
        min_value: offeringLimits[component.type].min,
        max_value: offeringLimits[component.type].max,
        discountApplied,
        discountAmount,
        discountPercent,
        discountDeferred,
      };
    });
    const fixedComponents = components.filter(
      (component) => component.billing_type === 'fixed',
    );
    const fixedSubTotal = fixedComponents.reduce(
      (result, item) => result + item.subTotal,
      0,
    );

    const limitComponents = components.filter(
      (component) => component.billing_type === 'limit',
    );
    const limitSubTotal = limitComponents.reduce(
      (result, item) => result + item.subTotal,
      0,
    );

    const prepaidComponents = components.filter(
      (component) =>
        component.billing_type === 'one' && component.is_prepaid === true,
    );
    const prepaidSubTotal = prepaidComponents.reduce(
      (result, item) => result + item.subTotal,
      0,
    );

    const subscriptionSubTotal =
      fixedSubTotal + limitSubTotal + prepaidSubTotal;
    const totalPeriods = multipliers.map(
      (mult) => mult * subscriptionSubTotal || 0,
    );

    const total = subscriptionSubTotal;

    return { components, periods, total, totalPeriods, periodKeys };
  } else {
    return {
      components: [],
      periods: [],
      total: 0,
      totalPeriods: [],
      periodKeys: [],
    };
  }
};

const calculateTotalPeriods = (components: Component[]) => {
  return components.reduce((totalPeriods, component) => {
    component.prices.forEach((price, i) => {
      if (!totalPeriods[i]) totalPeriods[i] = 0;
      totalPeriods[i] += price;
    });
    return totalPeriods;
  }, []);
};

export const LIMIT_PERIODS: LimitPeriodEnum[] = [
  'month',
  'quarterly',
  'annual',
];

export const useComponentsDetailPrices = (prices: PricesData) => {
  const fixedRows = prices.components.filter(
    (component) => component.billing_type === 'fixed',
  );
  const initialRows = prices.components.filter(
    (component) =>
      component.billing_type === 'one' && component.is_prepaid == false,
  );
  const prepaidRows = prices.components.filter(
    (component) =>
      component.billing_type === 'one' && component.is_prepaid == true,
  );

  // Identify usage components that serve as overage for prepaid components
  const overageTypes = new Set(
    prepaidRows.map((c) => c.overage_component).filter(Boolean),
  );
  const overageRows = prices.components.filter(
    (component) =>
      component.billing_type === 'usage' && overageTypes.has(component.type),
  );
  const usageRows = prices.components.filter(
    (component) =>
      component.billing_type === 'usage' && !overageTypes.has(component.type),
  );
  const switchRows = prices.components.filter(
    (component) => component.billing_type === 'few',
  );
  const limitedRows = prices.components.filter(
    (component) => component.billing_type === 'limit',
  );
  const totalLimitedRows = limitedRows.filter(
    (component) =>
      !component.limit_period || component.limit_period === 'total',
  );
  const periodicLimitedRows = limitedRows.filter(
    (component) => component.limit_period && component.limit_period !== 'total',
  );

  const periodicLimitedRowsByPeriod = useMemo<
    Record<
      LimitPeriodEnum,
      { rows: Component[]; totalPeriods: number[]; total: number }
    >
  >(
    () =>
      LIMIT_PERIODS.reduce(
        (acc, per) => {
          const rows = periodicLimitedRows.filter(
            (component) => component.limit_period === per,
          );
          acc[per] = {
            rows: rows,
            totalPeriods: calculateTotalPeriods(rows),
            total: Number(sumBy(rows, 'subTotal').toFixed(2)),
          };
          return acc;
        },
        {} as Record<
          LimitPeriodEnum,
          { rows: Component[]; totalPeriods: number[]; total: number }
        >,
      ),
    [periodicLimitedRows],
  );

  const fixedTotalPeriods = useMemo(
    () => calculateTotalPeriods(fixedRows),
    [fixedRows],
  );
  const periodicLimitedTotalPeriods = useMemo(
    () => calculateTotalPeriods(periodicLimitedRows),
    [periodicLimitedRows],
  );
  const initialTotalPeriods = useMemo(
    () => calculateTotalPeriods(initialRows),
    [initialRows],
  );
  const prepaidTotalPeriods = useMemo(
    () => calculateTotalPeriods(prepaidRows),
    [prepaidRows],
  );

  const switchTotalPeriods = useMemo(
    () => calculateTotalPeriods(switchRows),
    [switchRows],
  );
  const totalLimitTotalPeriods = useMemo(
    () => calculateTotalPeriods(totalLimitedRows),
    [totalLimitedRows],
  );

  const periodicTotalPeriods: number[] = useMemo(
    () =>
      prices.periods.map(
        (_, i) =>
          (fixedTotalPeriods[i] || 0) + (periodicLimitedTotalPeriods[i] || 0),
      ),
    [fixedTotalPeriods, periodicLimitedTotalPeriods],
  );

  const periodicTotal: number = useMemo(
    () =>
      Number(
        sumBy(
          (fixedRows || []).concat(periodicLimitedRows || []),
          'subTotal',
        ).toFixed(2),
      ),
    [fixedRows, periodicLimitedRows],
  );

  const oneTimeTotal: number = useMemo(
    () =>
      (initialTotalPeriods[0] || 0) +
      (prepaidTotalPeriods[0] || 0) +
      (switchTotalPeriods[0] || 0) +
      (totalLimitTotalPeriods[0] || 0),
    [initialTotalPeriods, switchTotalPeriods, totalLimitTotalPeriods],
  );

  const hasPeriodicCost =
    fixedRows.length > 0 ||
    usageRows.length > 0 ||
    periodicLimitedRows.length > 0;
  const hasOneTimeCost =
    initialRows.length > 0 ||
    switchRows.length > 0 ||
    totalLimitedRows.length > 0 ||
    prepaidRows.length > 0;

  return {
    periodic: {
      hasPeriodicCost,
      fixedRows,
      fixedTotalPeriods,
      usageRows,
      limitedRows: periodicLimitedRows,
      limitedRowsByPeriod: periodicLimitedRowsByPeriod,
      limitedTotalPeriods: periodicLimitedTotalPeriods,
      totalPeriods: periodicTotalPeriods,
      total: periodicTotal,
      /** Consider the fixed and usage based components on a monthly basis for now. */
      hasMonthlyCost:
        periodicLimitedRowsByPeriod['month'].rows.length > 0 ||
        fixedRows.length > 0 ||
        usageRows.length > 0,
    },
    oneTime: {
      hasOneTimeCost,
      initialRows,
      prepaidRows,
      overageRows,
      switchRows,
      totalLimitedRows,
      initialTotalPeriods,
      prepaidTotalPeriods,
      switchTotalPeriods,
      totalLimitTotalPeriods,
      oneTimeTotal,
    },
  };
};

export const useOrderPrices = (props: {
  offering: Pick<PublicOfferingDetails, 'type' | 'components' | 'plans'>;
  plan?: any;
  limits?: any;
  order?: any;
  viewMode?: boolean;
  type?: string;
}): PricesData => {
  const formData = useOrderFormData();

  const plan: Plan = useMemo(() => {
    if (props.viewMode && props.order) {
      if (props.order.plan_uuid) {
        if (props.type && props.type === 'old') {
          return props.offering.plans?.find(
            (plan) => plan.uuid === props.order.old_plan_uuid,
          );
        }
        return props.offering.plans?.find(
          (plan) => plan.uuid === props.order.plan_uuid,
        );
      } else {
        return props.offering.plans?.[0];
      }
    }
    return formData?.plan || props.plan;
  }, [props, formData]);

  const limits: Limits = useMemo(() => {
    const limitParser = getFormLimitParser(props.offering.type);
    if (props.viewMode && props.order) {
      return limitParser(props.order.limits);
    }
    return formData?.limits || props.limits;
  }, [props, formData]);

  const endDate = formData?.attributes?.end_date;
  const startDate = formData?.start_date;

  return useMemo(
    () => combinePrices(plan, limits, {}, props.offering, endDate, startDate),
    [plan, limits, props.offering, endDate, startDate],
  );
};

interface CostParts {
  total: string;
  details: string;
}

/**
 * Generates an object with total cost and calculation details for a prepaid component.
 * @param component The offering component, whose `amount` is the total for the period.
 * @param endDate The subscription end date, used to calculate duration.
 * @returns An object with `total` and `details` strings.
 */
export const getPrepaidCostParts = (
  component: Component,
  endDate: string,
  startDate?: string,
): CostParts => {
  const currency = ENV.plugins.WALDUR_CORE.CURRENCY_NAME;
  const formattedTotal = formatCurrency(component.subTotal, currency, 4);

  // Don't show details if the price or amount is zero
  if (component.price === 0 || component.amount === 0) {
    return {
      total: formattedTotal,
      details: '', // Return empty details string
    };
  }

  const effectiveStartDate = startDate || DateTime.now().toISODate();
  const durationInMonths = calculateMonthsDifference(
    effectiveStartDate,
    endDate,
  );

  // The component.amount is the total for the whole period.
  // We need the base amount per month for the details string.
  const baseAmount =
    durationInMonths > 0
      ? component.amount / durationInMonths
      : component.amount;

  const formattedPrice = formatCurrency(component.price, currency, 4);
  const calculationBase = `(${baseAmount} ${component.measured_unit} × ${formattedPrice})`;

  // Only add the duration part if it's more than one month
  const durationDetails =
    durationInMonths > 1 ? ` x ${durationInMonths} ${translate('mo')}` : '';

  return {
    total: formattedTotal,
    details: `${calculationBase}${durationDetails}`,
  };
};

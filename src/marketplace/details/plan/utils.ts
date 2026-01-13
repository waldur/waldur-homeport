import { sumBy } from 'lodash-es';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  BasePublicPlan,
  BillingUnit,
  LimitPeriodEnum,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { calculateMonthsDifference } from '@waldur/core/dateUtils';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import {
  filterOfferingComponents,
  getFormLimitParser,
} from '@waldur/marketplace/common/registry';
import { getBillingPeriods } from '@waldur/marketplace/common/utils';
import { orderFormSelector } from '@waldur/marketplace/deploy/selectors';
import { Limits } from '@waldur/marketplace/details/types';
import { parseOfferingLimits } from '@waldur/marketplace/offerings/store/limits';
import { Plan } from '@waldur/marketplace/types';

import { Component, PricesData } from './types';

export const combinePrices = (
  plan: BasePublicPlan,
  limits: Limits,
  usages: Limits,
  offering: PublicOfferingDetails,
  end_date?: string,
): PricesData => {
  if (plan && offering) {
    const { periods, multipliers, periodKeys } = getBillingPeriods(plan.unit);
    const offeringLimits = parseOfferingLimits(offering);
    const offeringComponents = filterOfferingComponents(offering);

    // Calculate the duration multiplier based on the end_date
    const durationInMonths = calculateMonthsDifference(
      DateTime.now().toISODate(),
      end_date,
    );

    const components: Component[] = offeringComponents.map((component) => {
      let amount = 0;
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
          if (durationInMonths) {
            amount *= durationInMonths;
          }
        } else {
          // For non-prepaid one-time components, use plan quotas if available.
          amount =
            plan.quotas && plan.quotas[component.type]
              ? plan.quotas[component.type]
              : 1;
        }
      }
      const price = plan.prices[component.type] || 0;
      // Calculate pricePerBillingPeriod based on plan.unit and component.limit_period
      const pricePerBillingPeriod = calculatePricePerBillingPeriod(
        price,
        component.limit_period as LimitPeriodEnum,
        plan.unit,
      );

      const subTotal = price * amount;
      const subTotalPerBillingPeriod =
        (pricePerBillingPeriod || price) * amount;
      const prices = multipliers.map((mult) => mult * subTotalPerBillingPeriod);
      return {
        ...component,
        amount,
        prices,
        subTotal,
        price,
        pricePerBillingPeriod,
        min_value: offeringLimits[component.type].min,
        max_value: offeringLimits[component.type].max,
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

const LIMIT_PERIOD_IN_MONTHS: Partial<Record<LimitPeriodEnum, number>> = {
  month: 1,
  quarterly: 3,
  annual: 12,
};
const BILLING_UNIT_IN_MONTHS: Partial<Record<BillingUnit, number>> = {
  month: 1,
  quarter: 3,
  half_month: 0.5,
  day: 1 / 30,
  hour: 1 / (30 * 24),
};

const calculatePricePerBillingPeriod = (
  price: number,
  limitPeriod: LimitPeriodEnum,
  billingUnit: BillingUnit,
): number => {
  if (billingUnit === 'quantity') {
    return price;
  }

  const limitPeriodInMonths = LIMIT_PERIOD_IN_MONTHS[limitPeriod];
  const billingUnitInMonths = BILLING_UNIT_IN_MONTHS[billingUnit];

  if (!billingUnitInMonths) {
    throw new Error(`Unsupported billing unit: ${billingUnit}`);
  }

  // price per month
  const pricePerMonth = price / limitPeriodInMonths;

  // price per billing unit
  const pricePerBillingPeriod = pricePerMonth * billingUnitInMonths;

  // safely rounding to avoid floating point issues
  return Number(pricePerBillingPeriod.toFixed(6));
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
  const usageRows = prices.components.filter(
    (component) => component.billing_type === 'usage',
  );
  const initialRows = prices.components.filter(
    (component) =>
      component.billing_type === 'one' && component.is_prepaid == false,
  );
  const prepaidRows = prices.components.filter(
    (component) =>
      component.billing_type === 'one' && component.is_prepaid == true,
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
      { rows: Component[]; totalPeriods: number[]; total: number[] }
    >
  >(
    () =>
      LIMIT_PERIODS.reduce((acc, per) => {
        const rows = periodicLimitedRows.filter(
          (component) => component.limit_period === per,
        );
        acc[per] = {
          rows: rows,
          totalPeriods: calculateTotalPeriods(rows),
          total: Number(sumBy(rows, 'subTotal').toFixed(2)),
        };
        return acc;
      }, {} as any),
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

const getPlan = (state, props) => {
  if (props.viewMode && props.order) {
    if (props.order.plan_uuid) {
      if (props.type && props.type === 'old') {
        return props.offering.plans.find(
          (plan) => plan.uuid === props.order.old_plan_uuid,
        );
      }
      return props.offering.plans.find(
        (plan) => plan.uuid === props.order.plan_uuid,
      );
    } else {
      return props.offering.plans[0];
    }
  } else {
    return orderFormSelector(state, 'plan');
  }
};

const getLimits = (state, props) => {
  const limitParser = getFormLimitParser(props.offering.type);
  if (props.viewMode && props.order) {
    return limitParser(props.order.limits);
  } else {
    return orderFormSelector(state, 'limits');
  }
};

export const getEndDate = (state) => {
  return orderFormSelector(state, 'attributes.end_date');
};

export const getStartDate = (state) => {
  return orderFormSelector(state, 'start_date');
};

export const pricesSelector = (state, props): PricesData => {
  const plan: Plan = getPlan(state, props) || props.plan;
  const limits: Limits = getLimits(state, props) || props.limits;
  const endDate = getEndDate(state);
  return combinePrices(plan, limits, {}, props.offering, endDate);
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

  const durationInMonths = calculateMonthsDifference(
    DateTime.now().toISODate(),
    endDate,
  );

  // The component.amount is the total for the whole period.
  // We need the base amount per month for the details string.
  const baseAmount = component.amount / durationInMonths;

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

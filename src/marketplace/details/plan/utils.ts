import { useMemo } from 'react';

import {
  getFormLimitParser,
  filterOfferingComponents,
} from '@waldur/marketplace/common/registry';
import { getBillingPeriods } from '@waldur/marketplace/common/utils';
import { offeringSelector } from '@waldur/marketplace/details/selectors';
import { Limits } from '@waldur/marketplace/details/types';
import { parseOfferingLimits } from '@waldur/marketplace/offerings/store/limits';
import { Plan, Offering } from '@waldur/marketplace/types';

import { Component, PricesData } from './types';

export const combinePrices = (
  plan: Plan,
  limits: Limits,
  usages: Limits,
  offering: Offering,
): PricesData => {
  if (plan && offering) {
    const { periods, multipliers, periodKeys } = getBillingPeriods(plan.unit);
    const offeringLimits = parseOfferingLimits(offering);
    const offeringComponents = filterOfferingComponents(offering);
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
        amount = 1;
      }
      const price = plan.prices[component.type] || 0;
      const subTotal = price * amount;
      const prices = multipliers.map((mult) => mult * subTotal);
      return {
        ...component,
        amount,
        prices,
        subTotal,
        price,
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

    const subscriptionSubTotal = fixedSubTotal + limitSubTotal;
    const totalPeriods = multipliers.map(
      (mult) => mult * subscriptionSubTotal || 0,
    );

    const initPrice =
      typeof plan.init_price === 'string'
        ? parseFloat(plan.init_price)
        : plan.init_price;
    const total = subscriptionSubTotal + initPrice;

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

export const useComponentsDetailPrices = (prices: PricesData) => {
  const fixedRows = prices.components.filter(
    (component) => component.billing_type === 'fixed',
  );
  const usageRows = prices.components.filter(
    (component) => component.billing_type === 'usage',
  );
  const initialRows = prices.components.filter(
    (component) => component.billing_type === 'one',
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
  const switchTotalPeriods = useMemo(
    () => calculateTotalPeriods(switchRows),
    [switchRows],
  );
  const totalLimitTotalPeriods = useMemo(
    () => calculateTotalPeriods(totalLimitedRows),
    [totalLimitedRows],
  );

  const periodicTotal: number[] = useMemo(
    () =>
      prices.periods.map(
        (_, i) =>
          (fixedTotalPeriods[i] || 0) + (periodicLimitedTotalPeriods[i] || 0),
      ),
    [fixedTotalPeriods, periodicLimitedTotalPeriods],
  );

  const oneTimeTotal: number = useMemo(
    () =>
      (initialTotalPeriods[0] || 0) +
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
    totalLimitedRows.length > 0;

  return {
    periodic: {
      hasPeriodicCost,
      fixedRows,
      fixedTotalPeriods,
      usageRows,
      periodicLimitedRows,
      periodicLimitedTotalPeriods,
      periodicTotal,
    },
    oneTime: {
      hasOneTimeCost,
      initialRows,
      switchRows,
      totalLimitedRows,
      initialTotalPeriods,
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
    return offeringSelector(state, 'plan');
  }
};

const getLimits = (state, props) => {
  const limitParser = getFormLimitParser(props.offering.type);
  if (props.viewMode && props.order) {
    return limitParser(props.order.limits);
  } else {
    return offeringSelector(state, 'limits');
  }
};

export const pricesSelector = (state, props): PricesData => {
  const plan: Plan = getPlan(state, props) || props.plan;
  const limits: Limits = getLimits(state, props) || props.limits;
  return combinePrices(plan, limits, {}, props.offering);
};

export const getStartingPrice = (offering: Offering) => {
  const prices = offering.plans.map((plan) => {
    return combinePrices(plan, null, null, offering).total;
  });
  return Math.min(...prices);
};

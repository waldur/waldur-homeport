import { translate } from '@waldur/i18n';
import { offeringSelector } from '@waldur/marketplace/details/selectors';
import { Limits } from '@waldur/marketplace/details/types';
import { Plan } from '@waldur/marketplace/types';

import { Component, PricesData } from './types';

interface BillingPeriodDescription {
  periods: string[];
  multipliers: number[];
}

function getBillingPeriods(unit: string): BillingPeriodDescription {
  switch (unit) {
    case 'day':
      return {
        periods: [
          translate('Price per day'),
          translate('Price per 30 days'),
          translate('Price per 365 days'),
        ],
        multipliers: [1, 30, 365],
      };

    case 'half_month':
      return {
        periods: [
          translate('Price per half-month'),
          translate('Price per month'),
          translate('Price per year'),
        ],
        multipliers: [1, 2, 24],
      };

    case 'month':
      return {
        periods: [
          translate('Price per month'),
          translate('Price per year'),
        ],
        multipliers: [1, 12],
      };
  }
}

export const combinePrices = (plan, limits, offering) => {
  if (plan && offering) {
    const {periods, multipliers} = getBillingPeriods(plan.unit);
    const components: Component[] = offering.components
      .map(item => {
        const label = item.name;
        const units = item.measured_unit;
        let amount = 0;
        if (item.billing_type === 'fixed') {
          amount = plan.quotas[item.type];
        } else if (limits && limits[item.type]) {
          amount = limits[item.type];
        }
        const type = item.type;
        const billing_type = item.billing_type;
        const subTotal = plan.prices[type] * amount;
        const prices = multipliers.map(mult => mult * subTotal);
        return {label, units, amount, prices, type, billing_type, subTotal};
      });
    const usageComponents = components.filter(component => component.billing_type === 'usage');
    const total = parseFloat(plan.unit_price) + usageComponents.reduce((result, item) => result + item.subTotal, 0);
    const totalPeriods = multipliers.map(mult => mult * total);
    return {components, periods, total, totalPeriods};
  } else {
    return {components: [], periods: [], total: 0, totalPeriods: []};
  }
};

const getPlan = (state, props) => {
  if (!props.viewMode) {
    return  offeringSelector(state, 'plan');
  }
  if (props.viewMode && !!props.offering.plans.length) {
    return props.offering.plans[0];
  }
};

const getLimits = (state, props) => {
  if (props.viewMode) {
    return props.orderItem.quotas.reduce((acc, quota) => {
      acc[quota.type] = quota.limit;
      return acc;
    }, {});
  } else {
    return offeringSelector(state, 'limits');
  }
};

export const pricesSelector = (state, props): PricesData => {
  const plan: Plan = getPlan(state, props);
  const limits: Limits = getLimits(state, props);
  return combinePrices(plan, limits, props.offering);
};

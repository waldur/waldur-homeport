import { translate } from '@waldur/i18n';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
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
    case 'hour':
      return {
        periods: [
          translate('Price per hour'),
          translate('Price per day'),
          translate('Price per 30 days'),
          translate('Price per 365 days'),
        ],
        multipliers: [1, 24, 24 * 30, 24 * 365],
      };

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

    default:
      return {
        periods: [translate('Price for consumption')],
        multipliers: [1],
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
        if (limits && limits[item.type]) {
          amount = limits[item.type] || 0;
        } else if (item.billing_type === 'fixed') {
          amount = plan.quotas[item.type] || 0;
        }
        const type = item.type;
        const billing_type = item.billing_type;
        const price = plan.prices[type] || 0;
        const subTotal = price * amount;
        const prices = multipliers.map(mult => mult * subTotal);
        return {
          label, units, amount, prices, type, billing_type, subTotal, price,
          disable_quotas: item.disable_quotas,
        };
      });

    const usageComponents = components.filter(component => component.billing_type === 'usage');
    const usageSubTotal = usageComponents.reduce((result, item) => result + item.subTotal, 0);

    const fixedComponents = components.filter(component => component.billing_type === 'fixed');
    const fixedSubTotal = fixedComponents.reduce((result, item) => result + item.subTotal, 0);

    const subscriptionSubTotal = usageSubTotal + fixedSubTotal;
    const subscriptionSubTotalPeriods = multipliers.map(mult => mult * subscriptionSubTotal || 0);

    const total = subscriptionSubTotal + parseFloat(plan.init_price);
    const totalPeriods = subscriptionSubTotalPeriods.map(val => val + parseFloat(plan.init_price));

    return {components, periods, total, totalPeriods};
  } else {
    return {components: [], periods: [], total: 0, totalPeriods: []};
  }
};

const getPlan = (state, props) => {
  if (props.viewMode) {
    if (props.orderItem.plan_uuid) {
      return props.offering.plans.find(plan => plan.uuid === props.orderItem.plan_uuid);
    } else {
      return props.offering.plans[0];
    }
  } else {
    return offeringSelector(state, 'plan');
  }
};

const getLimits = (state, props) => {
  const limitParser = getFormLimitParser(props.offering.type);
  if (props.viewMode) {
    return limitParser(props.orderItem.limits);
  } else {
    return offeringSelector(state, 'limits');
  }
};

export const pricesSelector = (state, props): PricesData => {
  const plan: Plan = getPlan(state, props);
  const limits: Limits = getLimits(state, props);
  return combinePrices(plan, limits, props.offering);
};

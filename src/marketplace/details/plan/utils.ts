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
  offering: Offering,
): PricesData => {
  if (plan && offering) {
    const { periods, multipliers } = getBillingPeriods(plan.unit);
    const offeringLimits = parseOfferingLimits(offering);
    const offeringComponents = filterOfferingComponents(offering);
    const components: Component[] = offeringComponents.map(component => {
      let amount = 0;
      if (limits && limits[component.type]) {
        amount = limits[component.type] || 0;
      } else if (component.billing_type === 'fixed') {
        amount = plan.quotas[component.type] || 0;
      }
      const price = plan.prices[component.type] || 0;
      const subTotal = price * amount;
      const prices = multipliers.map(mult => mult * subTotal);
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

    const usageComponents = components.filter(
      component => component.billing_type === 'usage',
    );
    const usageSubTotal = usageComponents.reduce(
      (result, item) => result + item.subTotal,
      0,
    );

    const fixedComponents = components.filter(
      component => component.billing_type === 'fixed',
    );
    const fixedSubTotal = fixedComponents.reduce(
      (result, item) => result + item.subTotal,
      0,
    );

    const subscriptionSubTotal = usageSubTotal + fixedSubTotal;
    const subscriptionSubTotalPeriods = multipliers.map(
      mult => mult * subscriptionSubTotal || 0,
    );

    const initPrice =
      typeof plan.init_price === 'string'
        ? parseFloat(plan.init_price)
        : plan.init_price;
    const total = subscriptionSubTotal + initPrice;
    const totalPeriods = subscriptionSubTotalPeriods.map(
      val => val + initPrice,
    );

    return { components, periods, total, totalPeriods };
  } else {
    return { components: [], periods: [], total: 0, totalPeriods: [] };
  }
};

const getPlan = (state, props) => {
  if (props.viewMode && props.orderItem) {
    if (props.orderItem.plan_uuid) {
      return props.offering.plans.find(
        plan => plan.uuid === props.orderItem.plan_uuid,
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
  if (props.viewMode && props.orderItem) {
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

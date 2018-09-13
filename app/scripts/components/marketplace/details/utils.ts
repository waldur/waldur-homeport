import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { translate } from '@waldur/i18n';
import { getOfferingComponents } from '@waldur/marketplace/common/registry';
import { Plan } from '@waldur/marketplace/types';

import { FORM_ID } from './constants';

interface BillingPeriodDescription {
  periods: string[];
  multipliers: number[];
}

interface PlanComponentComputedProps {
  label: string;
  units: string;
  amount: number;
  prices: number[];
}

interface ConnectedPricesOwnProps {
  type: string;
}

interface ConnectedPricesComputedProps {
  components: PlanComponentComputedProps[];
  periods: string[];
  hasComponents: boolean;
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

export const connectPrices = connect<ConnectedPricesComputedProps, any, ConnectedPricesOwnProps>((state, ownProps) => {
  const selector = formValueSelector(FORM_ID);
  const plan: Plan = selector(state, 'plan');
  const hasComponents = plan && plan.components.length > 0;
  if (plan) {
    const offeringComponents = getOfferingComponents(ownProps.type);
    const componentsMap = offeringComponents.reduce(
      (result, item) => ({...result, [item.type]: item}), {});
    const {periods, multipliers} = getBillingPeriods(plan.unit);
    const components = plan.components
      .filter(item => componentsMap.hasOwnProperty(item.type))
      .map(item => {
        const label = componentsMap[item.type].label;
        const units = componentsMap[item.type].units;
        const amount = item.amount;
        const total = parseFloat(item.price) * amount;
        const prices = multipliers.map(mult => mult * total);
        return {label, units, amount, prices};
      });
    return {hasComponents, components, periods};
  } else {
    return {hasComponents, components: [], periods: []};
  }
});

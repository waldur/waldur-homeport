import { translate } from '@waldur/i18n';

export const BillingPeriod = props => {
  const labels = {
    month: translate('Price per month'),
    half_month: translate('Price per half month'),
    day: translate('Price per day'),
    hour: translate('Price per hour'),
    quantity: translate('Price per unit'),
  };
  return labels[props.unit];
};

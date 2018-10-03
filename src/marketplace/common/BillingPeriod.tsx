import { translate } from '@waldur/i18n';

export const BillingPeriod = props => {
  const labels = {
    month: translate('Price per month'),
    half_month: translate('Price per half month'),
    day: translate('Price per day'),
  };
  return labels[props.unit];
};

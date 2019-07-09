import { translate } from '@waldur/i18n';

export const getBillingPeriods = () => ([
  {
    label: translate('Per month'),
    value: 'month',
  },
  {
    label: translate('Per half month'),
    value: 'half_month',
  },
  {
    label: translate('Per day'),
    value: 'day',
  },
  {
    label: translate('Per hour'),
    value: 'hour',
  },
]);

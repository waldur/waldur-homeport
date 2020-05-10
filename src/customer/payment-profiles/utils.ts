import { translate } from '@waldur/i18n';

export const getInitialValues = props => ({
  name: props.resolve.name,
  payment_type: props.resolve.payment_type,
  end_date: props.resolve.attributes.end_date,
  agreement_number: props.resolve.attributes.agreement_number,
});

export const getPaymentProfileTypeOptions = () => [
  { label: translate('Fixed-price contract'), value: 'fixed_price' },
  { label: translate('Monthly invoices'), value: 'invoices' },
  {
    label: translate('Payment gateways (monthly)'),
    value: 'payment_gw_monthly',
  },
];

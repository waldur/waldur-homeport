import { translate } from '@waldur/i18n';

export const getInitialValues = (props) => ({
  name: props.name,
  payment_type: props.payment_type,
  end_date: props.attributes.end_date,
  agreement_number: props.attributes.agreement_number,
  contract_sum: props.attributes.contract_sum,
});

export const getPaymentProfileTypeOptions = () => [
  { label: translate('Fixed-price contract'), value: 'fixed_price' },
  { label: translate('Monthly invoices'), value: 'invoices' },
  {
    label: translate('Payment gateways (monthly)'),
    value: 'payment_gw_monthly',
  },
];

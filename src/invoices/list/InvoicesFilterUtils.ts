import { translate } from '@/i18n';

export const getInvoiceStatusOptions = () => [
  { label: translate('Pending'), value: 'pending' },
  { label: translate('Pending finalization'), value: 'pending_finalization' },
  { label: translate('Canceled'), value: 'canceled' },
  { label: translate('Created'), value: 'created' },
  { label: translate('Paid'), value: 'paid' },
];

export const getInvoiceStateLabel = (state: string) => {
  const option = getInvoiceStatusOptions().find((s) => s.value === state);
  return option ? option.label : state;
};

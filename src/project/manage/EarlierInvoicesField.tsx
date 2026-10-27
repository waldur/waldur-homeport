import { FC } from 'react';

import { BooleanGroup, DateGroup, RadioGroup } from '@/form';
import { translate } from '@/i18n';

export const EARLIER_INVOICES_FIELDS = [
  'pay_earlier_invoices',
  'earlier_invoices_from',
  'earlier_invoices_until',
  'earlier_invoices_compensate_in',
];

/** Where a payment of an earlier invoice is written. */
export const getCompensateInOptions = () => [
  {
    value: 'current_month',
    label: translate('Current month'),
    description: translate(
      'On the invoice open when it is paid. Earlier invoices stay as they were issued.',
    ),
  },
  {
    value: 'incurred_month',
    label: translate('Month the cost was incurred'),
    description: translate(
      'On the paid month’s own invoice. This changes the total of an invoice already issued, and possibly paid.',
    ),
  },
];

export const formatCompensateIn = (value: string | undefined) =>
  getCompensateInOptions().find((option) => option.value === value)?.label;

const onlyFirstDayOfMonth = (date: Date) => date.getDate() === 1;

/** The staff-only setting that lets the allocation pay earlier invoices. */
export const EarlierInvoicesField: FC<{ name: string }> = ({ name }) => {
  if (name === 'pay_earlier_invoices') {
    return (
      <BooleanGroup
        name="pay_earlier_invoices"
        type="checkbox"
        label={translate('Pay earlier invoices')}
        description={translate(
          "What is left of the allocation also pays the cost of the project's closed invoices that no credit covered, oldest month first: at once when saved, and at the end of every month. Payments are not undone when this is turned off.",
        )}
      />
    );
  }
  if (name === 'earlier_invoices_compensate_in') {
    return (
      <RadioGroup
        name="earlier_invoices_compensate_in"
        label={translate('Write the compensation on')}
        choices={getCompensateInOptions()}
      />
    );
  }
  return (
    <DateGroup
      name={name}
      label={
        name === 'earlier_invoices_from'
          ? translate('Earlier invoices from')
          : translate('Earlier invoices until')
      }
      description={
        name === 'earlier_invoices_from'
          ? translate('First month to pay. Empty: from the first invoice.')
          : translate(
              'Last month to pay. Empty: up to the last closed invoice.',
            )
      }
      placeholder={translate('Select month...')}
      enable={[onlyFirstDayOfMonth]}
    />
  );
};

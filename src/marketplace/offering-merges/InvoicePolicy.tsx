import { FC } from 'react';
import { InvoicePolicyEnum } from 'waldur-js-client';

import { RadioGroup } from 'waldur-ui';

import { translate } from '@/i18n';

const getInvoicePolicyOptions = (): {
  value: InvoicePolicyEnum;
  label: string;
  description: string;
}[] => [
  {
    value: 'open_month',
    label: translate('Current open month'),
    description: translate(
      'Only items on invoices that can still change are rewritten to name the target offering, plan and component. Closed invoices keep naming the sources.',
    ),
  },
  {
    value: 'all_months',
    label: translate('All months'),
    description: translate(
      'Items on every invoice, closed ones included, are rewritten to name the target offering, plan and component. Use it when past invoices should read as if the target had always been used. Amounts never change.',
    ),
  },
];

export const InvoicePolicyLabel: FC<{ policy?: InvoicePolicyEnum }> = ({
  policy = 'open_month',
}) => (
  <>
    {getInvoicePolicyOptions().find((option) => option.value === policy)
      ?.label ?? policy}
  </>
);

export const InvoicePolicyChoice: FC<{
  value: InvoicePolicyEnum;
  onChange(value: InvoicePolicyEnum): void;
  toRewriteByPolicy?: Record<string, number>;
}> = ({ value, onChange, toRewriteByPolicy }) => (
  <RadioGroup
    aria-label={translate('Invoice policy')}
    name="invoice_policy"
    value={value}
    onValueChange={onChange}
    options={getInvoicePolicyOptions().map((option) => ({
      value: option.value,
      label: <span className="fw-semibold">{option.label}</span>,
      description: (
        <>
          {option.description}
          {toRewriteByPolicy?.[option.value] !== undefined && (
            <div>
              {translate('Invoice items rewritten: {count}', {
                count: toRewriteByPolicy[option.value],
              })}
            </div>
          )}
        </>
      ),
    }))}
  />
);

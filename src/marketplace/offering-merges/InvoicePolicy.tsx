import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { InvoicePolicyEnum } from 'waldur-js-client';

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
  <div className="d-flex flex-column gap-4">
    {getInvoicePolicyOptions().map((option) => (
      <Form.Check
        key={option.value}
        type="radio"
        id={`invoice-policy-${option.value}`}
        name="invoice_policy"
        checked={value === option.value}
        onChange={() => onChange(option.value)}
        label={
          <div>
            <div className="fw-semibold">{option.label}</div>
            <div className="text-muted fs-7">{option.description}</div>
            {toRewriteByPolicy?.[option.value] !== undefined && (
              <div className="text-muted fs-7">
                {translate('Invoice items rewritten: {count}', {
                  count: toRewriteByPolicy[option.value],
                })}
              </div>
            )}
          </div>
        }
      />
    ))}
  </div>
);

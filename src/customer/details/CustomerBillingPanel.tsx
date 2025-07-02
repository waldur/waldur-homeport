import { FC, useMemo } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { FieldEditButton } from './FieldEditButton';
import { CustomerEditPanelProps } from './types';

export const CustomerBillingPanel: FC<CustomerEditPanelProps> = (props) => {
  const detailsRows = useMemo(
    () => [
      {
        label: translate('Accounting start date'),
        key: 'accounting_start_date',
        value: formatDate(props.customer.accounting_start_date),
      },
      {
        label: translate('Bank name'),
        key: 'bank_name',
        value: props.customer.bank_name,
      },
      {
        label: translate('Bank account'),
        key: 'bank_account',
        value: props.customer.bank_account,
      },
    ],

    [props.customer],
  );

  const taxRows = useMemo(
    () => [
      {
        label: translate('VAT code'),
        key: 'vat_code',
        value: props.customer.vat_code,
      },
      {
        label: translate('Tax percentage'),
        key: 'default_tax_percent',
        value: props.customer.default_tax_percent,
      },
    ],

    [props.customer],
  );

  return (
    <>
      <FormTable.Card
        title={translate('Details')}
        className="card-bordered mb-5"
      >
        <FormTable>
          {detailsRows.map((row) => (
            <FormTable.Item
              key={row.key}
              label={row.label}
              value={row.value || 'N/A'}
              actions={
                <FieldEditButton
                  customer={props.customer}
                  name={row.key}
                  callback={props.callback}
                />
              }
            />
          ))}
        </FormTable>
      </FormTable.Card>

      <FormTable.Card title={translate('Tax')} className="card-bordered">
        <FormTable>
          {taxRows.map((row) => (
            <FormTable.Item
              key={row.key}
              label={row.label}
              value={row.value || 'N/A'}
              actions={
                <FieldEditButton
                  customer={props.customer}
                  name={row.key}
                  callback={props.callback}
                />
              }
            />
          ))}
        </FormTable>
      </FormTable.Card>
    </>
  );
};

import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { formatPeriod } from '../utils';

import { getInvoiceStatusOptions, InvoicesFilter } from './InvoicesFilter';
import { SendNotificationButton } from './SendNotificationButton';

const RecordPeriodField = ({ row }) => formatPeriod(row);

const RowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[SendNotificationButton]}
  />
);

export const BillingRecordsList: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const stateFilter: any = useSelector(getFormValues('InvoicesFilter'));
  const filter = useMemo(
    () => ({
      ...stateFilter,
      customer: customer.url,
      state: stateFilter?.state?.map((option) => option.value),
      field: [
        'uuid',
        'state',
        'month',
        'year',
        'invoice_date',
        'number',
        'price',
      ],
    }),
    [stateFilter, customer],
  );

  const table = useMemo(() => `invoices-${customer.uuid}`, [customer]);

  const props = useTable({
    table: table,
    fetchData: createFetcher('invoices'),
    filter,
    queryField: 'number',
  });

  return (
    <Table
      {...props}
      filters={<InvoicesFilter />}
      columns={[
        {
          title: translate('Record number'),
          render: ({ row }) => (
            <Link
              state="billingDetails"
              params={{ uuid: customer.uuid, invoice_uuid: row.uuid }}
            >
              {row.number}
            </Link>
          ),

          export: 'number',
        },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
          filter: 'state',
          inlineFilter: (row) => [
            getInvoiceStatusOptions().find((s) => s.value === row.state),
          ],

          export: 'state',
        },
        {
          title: translate('Record period'),
          render: RecordPeriodField,
          export: (row) => formatPeriod(row),
          exportKeys: ['year', 'month'],
        },
        {
          title: (
            <>
              <PriceTooltip /> {translate('Total')}
            </>
          ),

          render: ({ row }) => defaultCurrency(row.price),
          exportTitle: translate('Total'),
          export: (row) => defaultCurrency(row.price),
          exportKeys: ['price'],
        },
      ]}
      rowActions={RowActions}
      verboseName={translate('records')}
      title={translate('Invoices')}
      enableExport={true}
    />
  );
};

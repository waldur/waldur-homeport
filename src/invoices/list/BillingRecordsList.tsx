import { FunctionComponent, useMemo } from 'react';
import { invoicesList } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { PriceTooltip } from '@/price/PriceTooltip';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import {
  InvoicesFilter,
  InvoicesFilterFormId,
  selectInvoicesFilter,
} from '@/table/generated/InvoicesFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { formatPeriod } from '../utils';

import {
  getInvoiceStateLabel,
  getInvoiceStatusOptions,
} from './InvoicesFilterUtils';
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
  const customer = useCustomer();
  const table = useMemo(() => `invoices-${customer.uuid}`, [customer]);
  const values = useFilterValues(table);

  const stateFilter = useMemo(() => selectInvoicesFilter(values), [values]);

  const filter = useMemo(
    () => ({
      ...stateFilter,
      customer: customer.url,
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

  const props = useTable({
    table: table,
    syncFiltersToURL: true,
    fetchData: createFetcher(invoicesList),
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
          render: ({ row }) => getInvoiceStateLabel(row.state),
          filter: 'state',
          inlineFilter: (row) => [
            getInvoiceStatusOptions().find((s) => s.value === row.state),
          ],

          export: (row) => getInvoiceStateLabel(row.state),
          exportKeys: ['state'],
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
      showPageSizeSelector
      formId={InvoicesFilterFormId}
    />
  );
};

import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { invoicesList } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { INVOICES_TABLE } from '@waldur/invoices/constants';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import {
  InvoicesFilter,
  selectInvoicesFilter,
} from '@waldur/table/generated/InvoicesFilter';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { InvoicePayButton } from '../details/InvoicePayButton';

import {
  getInvoiceStateLabel,
  getInvoiceStatusOptions,
} from './InvoicesFilterUtils';
import { MarkAsPaidButton } from './MarkAsPaidButton';
import { SendNotificationButton } from './SendNotificationButton';

const RowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[SendNotificationButton, MarkAsPaidButton, InvoicePayButton]}
  />
);

const mapsStateToFilter = createSelector(
  getCustomer,
  selectInvoicesFilter,
  (customer, stateFilter) => ({
    ...stateFilter,
    customer: customer.url,
    field: [
      'uuid',
      'state',
      'due_date',
      'month',
      'year',
      'invoice_date',
      'number',
      'price',
      'tax',
      'total',
      'payment_url',
    ],
  }),
);

export const InvoicesList: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const filter = useSelector(mapsStateToFilter);
  const props = useTable({
    table: `${INVOICES_TABLE}-${customer.uuid}`,
    fetchData: createFetcher(invoicesList),
    filter,
    queryField: 'number',
  });
  const columns: Column[] = [
    {
      title: translate('Invoice number'),
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
      title: translate('Invoice date'),
      render: ({ row }) => renderFieldOrDash(row.invoice_date),
      export: 'invoice_date',
    },
    {
      title: translate('Due date'),
      render: ({ row }) => renderFieldOrDash(row.due_date),
      export: 'due_date',
    },
  ];

  const activeFixedPriceProfile = getActiveFixedPricePaymentProfile(
    customer.payment_profiles,
  );
  if (!activeFixedPriceProfile) {
    columns.push(
      {
        title: translate('Price'),
        render: ({ row }) => defaultCurrency(row.price),
        export: (row) => defaultCurrency(row.price),
        exportKeys: ['price'],
      },
      {
        title: translate('Tax'),
        render: ({ row }) => defaultCurrency(row.tax),
        export: (row) => defaultCurrency(row.tax),
        exportKeys: ['tax'],
      },
      {
        title: translate('Total'),
        render: ({ row }) => defaultCurrency(row.total),
        export: (row) => defaultCurrency(row.total),
        exportKeys: ['total'],
      },
    );
  }
  return (
    <Table
      {...props}
      filters={<InvoicesFilter />}
      columns={columns}
      verboseName={translate('invoices')}
      enableExport={true}
      rowActions={RowActions}
    />
  );
};

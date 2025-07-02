import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { INVOICES_TABLE } from '@waldur/invoices/constants';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { MarkAsPaidButton } from '@waldur/invoices/list/MarkAsPaidButton';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { InvoicePayButton } from '../details/InvoicePayButton';

import { getInvoiceStatusOptions, InvoicesFilter } from './InvoicesFilter';
import { SendNotificationButton } from './SendNotificationButton';

const RowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[SendNotificationButton, MarkAsPaidButton, InvoicePayButton]}
  />
);

export const InvoicesList: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const filter = useSelector(mapsStateToFilter);
  const props = useTable({
    table: `${INVOICES_TABLE}-${customer.uuid}`,
    fetchData: createFetcher('invoices'),
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
      render: ({ row }) => row.state,
      filter: 'state',
      inlineFilter: (row) => [
        getInvoiceStatusOptions().find((s) => s.value === row.state),
      ],

      export: 'state',
    },
    {
      title: translate('Invoice date'),
      render: ({ row }) => row.invoice_date || 'N/A',
      export: 'invoice_date',
    },
    {
      title: translate('Due date'),
      render: ({ row }) => row.due_date || 'N/A',
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

const mapsStateToFilter = createSelector(
  getCustomer,
  getFormValues('InvoicesFilter'),
  (customer, stateFilter: any) => ({
    ...stateFilter,
    customer: customer.url,
    state: stateFilter?.state?.map((option) => option.value),
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

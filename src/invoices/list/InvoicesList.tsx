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
import { Table, createFetcher } from '@waldur/table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { InvoicePayButton } from '../details/InvoicePayButton';

import { InvoicesFilter } from './InvoicesFilter';
import { SendNotificationButton } from './SendNotificationButton';

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
      hoverableRow={({ row }) => (
        <>
          <SendNotificationButton row={row} />
          <MarkAsPaidButton row={row} refetch={props.fetch} />
          <InvoicePayButton invoice={row} />
        </>
      )}
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

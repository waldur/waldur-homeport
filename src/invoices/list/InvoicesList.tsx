import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { invoicesList } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { INVOICES_TABLE } from '@/invoices/constants';
import { getActiveFixedPricePaymentProfile } from '@/invoices/details/utils';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import {
  InvoicesFilter,
  InvoicesFilterFormId,
  selectInvoicesFilter,
} from '@/table/generated/InvoicesFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

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

const InvoicesListTable: FunctionComponent = () => {
  const customer = useCustomer();
  const { values } = useFormState();
  const stateFilter = useMemo(() => selectInvoicesFilter(values), [values]);

  const filter = useMemo(
    () => ({
      ...stateFilter,
      customer: customer?.url,
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
    [stateFilter, customer],
  );

  const props = useTable({
    table: `${INVOICES_TABLE}-${customer?.uuid}`,
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
      formId={InvoicesFilterFormId}
      filters={<InvoicesFilter />}
      columns={columns}
      verboseName={translate('invoices')}
      enableExport={true}
      rowActions={RowActions}
      showPageSizeSelector
    />
  );
};

export const InvoicesList: FunctionComponent = () => (
  <Form
    id={InvoicesFilterFormId}
    onSubmit={() => {}}
    subscription={{ values: true }}
  >
    {() => <InvoicesListTable />}
  </Form>
);

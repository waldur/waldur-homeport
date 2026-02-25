import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { InvoiceItemDetail, invoiceItemsList } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { ComponentUsageImportButton } from '@waldur/invoices/import-usage';
import { createFetcher } from '@waldur/table/api';
import {
  selectSupportInvoiceItemsFilter,
  SupportInvoiceItemsFilter,
} from '@waldur/table/generated/SupportInvoiceItemsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

interface SupportInvoiceItemsListProps {
  initialValues: { accounting_period: { label: string; value: PeriodOption } };
  accountingPeriods: { label: string; value: PeriodOption }[];
}

export const SupportInvoiceItemsList: FunctionComponent<
  SupportInvoiceItemsListProps
> = ({ initialValues, accountingPeriods }) => {
  const filterValues = useSelector(selectSupportInvoiceItemsFilter);

  const tableProps = useTable({
    table: 'supportInvoiceItems',
    fetchData: createFetcher(invoiceItemsList),
    queryField: 'name',
    filter: filterValues,
  });

  return (
    <Table<InvoiceItemDetail>
      {...tableProps}
      filters={
        <SupportInvoiceItemsFilter
          accountingPeriods={accountingPeriods}
          initialValues={initialValues}
        />
      }
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          export: 'name',
        },
        {
          title: translate('Organization'),
          render: ({ row }) => {
            if (!row.customer_name) return renderFieldOrDash(row.customer_name);
            const invoiceUuid = row.invoice?.split('/').filter(Boolean).pop();
            return invoiceUuid ? (
              <Link
                state="billingDetails"
                params={{
                  uuid: row.customer_uuid,
                  invoice_uuid: invoiceUuid,
                }}
              >
                {row.customer_name}
              </Link>
            ) : (
              <Link
                state="organization-billing.billing"
                params={{ uuid: row.customer_uuid }}
              >
                {row.customer_name}
              </Link>
            );
          },
          export: 'customer_name',
          filter: 'organization',
        },
        {
          title: translate('Project'),
          render: ({ row }) => renderFieldOrDash(row.project_name),
          export: 'project_name',
          filter: 'project',
        },
        {
          title: translate('Offering'),
          render: ({ row }) => renderFieldOrDash(row.offering_name),
          export: 'offering_name',
          filter: 'offering',
        },
        {
          title: translate('Period'),
          render: ({ row }) => (
            <>
              {row.start
                ? `${new Date(row.start).getFullYear()}/${new Date(row.start).getMonth() + 1}`
                : '-'}
            </>
          ),
          export: (row) =>
            row.start
              ? `${new Date(row.start).getFullYear()}/${new Date(row.start).getMonth() + 1}`
              : '',
          filter: 'accounting_period',
        },
        {
          title: translate('Unit price'),
          render: ({ row }) => <>{defaultCurrency(row.unit_price)}</>,
          export: (row) => row.unit_price,
        },
        {
          title: translate('Quantity'),
          render: ({ row }) => <>{row.quantity}</>,
          export: 'quantity',
        },
        {
          title: translate('Total'),
          render: ({ row }) => <>{defaultCurrency(row.price)}</>,
          export: (row) => row.price,
        },
      ]}
      verboseName={translate('Invoice items')}
      hasQuery
      showPageSizeSelector
      enableExport
      tableActions={<ComponentUsageImportButton refetch={tableProps.fetch} />}
    />
  );
};

import { FunctionComponent, useMemo } from 'react';
import { InvoiceItemDetail, invoiceItemsList } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { PeriodOption } from '@/form/types';
import { translate } from '@/i18n';
import { ComponentUsageImportButton } from '@/invoices/import-usage';
import { createFetcher } from '@/table/api';
import {
  selectInvoiceItemsFilter,
  InvoiceItemsFilter,
  InvoiceItemsFilterFormId,
} from '@/table/generated/InvoiceItemsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface SupportInvoiceItemsListProps {
  initialValues: { accounting_period: { label: string; value: PeriodOption } };
  accountingPeriods: { label: string; value: PeriodOption }[];
}

export const SupportInvoiceItemsList: FunctionComponent<
  SupportInvoiceItemsListProps
> = ({ accountingPeriods }) => {
  const values = useFilterValues('supportInvoiceItems');
  const filterValues = useMemo(
    () => selectInvoiceItemsFilter(values),
    [values],
  );

  const tableProps = useTable({
    table: 'supportInvoiceItems',
    syncFiltersToURL: true,
    fetchData: createFetcher(invoiceItemsList),
    queryField: 'name',
    filter: filterValues,
  });

  return (
    <Table<InvoiceItemDetail>
      {...tableProps}
      formId={InvoiceItemsFilterFormId}
      filters={<InvoiceItemsFilter accountingPeriods={accountingPeriods} />}
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
          filter: 'customer_uuid',
        },
        {
          title: translate('Project'),
          render: ({ row }) => renderFieldOrDash(row.project_name),
          export: 'project_name',
          filter: 'project_uuid',
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

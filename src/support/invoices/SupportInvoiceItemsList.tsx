import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { InvoiceItemDetail, invoiceItemsList } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { ComponentUsageImportButton } from '@waldur/invoices/import-usage';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { SupportInvoiceItemsFilter } from './SupportInvoiceItemsFilter';

interface FilterValues {
  organization?: { uuid: string };
  accounting_period?: PeriodOption;
  project?: { uuid: string };
  offering?: { uuid: string };
}

const mapStateToFilter = createSelector(
  getFormValues('SupportInvoiceItemsFilter'),
  (filterValues: FilterValues) => {
    const result: Record<string, any> = {};
    if (filterValues?.organization) {
      result.customer_uuid = filterValues.organization.uuid;
    }
    if (filterValues?.accounting_period) {
      result.year = filterValues.accounting_period.year;
      result.month = filterValues.accounting_period.month;
    }
    if (filterValues?.project) {
      result.project_uuid = filterValues.project.uuid;
    }
    if (filterValues?.offering) {
      result.offering_uuid = filterValues.offering.uuid;
    }
    return result;
  },
);

interface SupportInvoiceItemsListProps {
  initialValues: { accounting_period: PeriodOption };
  accountingPeriods: PeriodOption[];
}

export const SupportInvoiceItemsList: FunctionComponent<
  SupportInvoiceItemsListProps
> = ({ initialValues, accountingPeriods }) => {
  const stateFilter = useSelector(mapStateToFilter);

  const filter = useMemo(() => stateFilter, [stateFilter]);

  const tableProps = useTable({
    table: 'supportInvoiceItems',
    fetchData: createFetcher(invoiceItemsList),
    queryField: 'name',
    filter,
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

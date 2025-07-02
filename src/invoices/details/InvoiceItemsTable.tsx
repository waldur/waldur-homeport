import { FC, ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { Badge } from '@waldur/core/Badge';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { INVOICE_ITEMS_FILTER_FORM } from '../constants';
import { Invoice, InvoiceItemsFilterData, InvoiceTableItem } from '../types';
import { formatPeriod } from '../utils';

import { InvoiceDetailActions } from './InvoiceDetailActions';
import { InvoiceItemExpandableRow } from './InvoiceItemExpandableRow';
import { InvoiceItemsFilter } from './InvoiceItemsFilter';
import { groupInvoiceItems } from './utils';

interface InvoiceItemsTableProps {
  invoice: Invoice;
  /**
   * `invoiceView` is for the user invoice view, when `ENV.accountingMode !== 'accounting'`
   * @see `src/invoices/details/BillingDetails.tsx`
   * */
  invoiceView?: boolean;
  refreshInvoiceItems(): void;
  showPrice?: boolean;
  showVat?: boolean;
  setTotalFiltered?(value: number): void;
  footer?: ReactNode;
}

const useFilters = () => {
  const filterValues = useSelector(
    getFormValues(INVOICE_ITEMS_FILTER_FORM),
  ) as InvoiceItemsFilterData;
  return useMemo(() => {
    const filter: Record<string, string> = {};
    if (filterValues) {
      if (filterValues.provider) {
        filter.provider_uuid = filterValues.provider.uuid;
      }
      if (filterValues.project) {
        filter.project_uuid = filterValues.project.uuid;
      }
      if (filterValues.offering) {
        filter.offering_uuid = filterValues.offering.uuid;
      }
      if (filterValues.conceal_compensation_items) {
        filter.conceal_compensation_items = 'true';
      }
    }
    return filter;
  }, [filterValues]);
};

export const InvoiceItemsTable: FC<InvoiceItemsTableProps> = ({
  invoice,
  invoiceView,
  showPrice,
  showVat,
  footer,
  refreshInvoiceItems,
  setTotalFiltered,
}) => {
  const filter = useFilters();
  const customer = useSelector(getCustomer);

  const fetchItems = useMemo(() => {
    return createFetcher(`invoices/${invoice.uuid}/items`);
  }, [invoice.uuid]);

  const tableProps = useTable({
    table: 'invoiceItems-' + invoice.uuid,
    fetchData: async (request) => {
      const response = await fetchItems(request);
      const rows = groupInvoiceItems(response.rows);

      if (setTotalFiltered) {
        const totalFiltered = rows.reduce((acc, row) => {
          const rowValue = invoiceView
            ? row.items.reduce(
                (itemAcc, item) => itemAcc + parseFloat(item.total || '0'),
                0,
              )
            : row.items.reduce(
                (itemAcc, item) =>
                  itemAcc + parseFloat(String(item.price || '0')),
                0,
              );
          return acc + rowValue;
        }, 0);
        setTotalFiltered(totalFiltered);
      }

      return { rows };
    },
    queryField: 'query',
    filter,
  });

  return (
    <Table<InvoiceTableItem>
      {...tableProps}
      filters={<InvoiceItemsFilter customerUuid={getUUID(invoice.customer)} />}
      columns={[
        {
          title: translate('Resource name'),
          render: ({ row }) => (
            <ResourceLink uuid={row.resource_uuid} label={row.resource_name} />
          ),
        },
        {
          title: translate('Offering'),
          render: ({ row }) => <>{row.offering_name}</>,
          filter: 'offering',
        },
        {
          title: translate('Project name'),
          render: ({ row }) => <>{row.project_name}</>,
          filter: 'project',
          inlineFilter: (row) => ({
            name: row.project_name,
            uuid: row.project_uuid,
          }),
        },
        {
          title: translate('Service provider'),
          render: ({ row }) => <>{row.service_provider_name}</>,
          filter: 'provider',
          inlineFilter: (row) => ({
            customer_name: row.service_provider_name,
            uuid: row.service_provider_uuid,
          }),
        },
        {
          title: translate('Plan name'),
          render: ({ row }) => <>{row.plan_name}</>,
        },
        {
          title: (
            <>
              {translate('Price')}
              <PriceTooltip />
            </>
          ),

          render: ({ row }) => <>{defaultCurrency(row.price)}</>,
          className: invoiceView ? undefined : 'w-150px',
        },
        ...(invoiceView
          ? [
              {
                title: translate('Tax'),
                render: ({ row }) => <>{defaultCurrency(row.tax)}</>,
              },
              {
                title: translate('Total'),
                render: ({ row }) => <>{defaultCurrency(row.total)}</>,
                className: 'w-150px',
              },
            ]
          : []),
      ]}
      title={
        <div className="text-nowrap">
          {translate('Invoice no.')} {invoice.number}
          {!invoiceView && customer.agreement_number && (
            <Badge
              variant="default"
              pill
              outline
              size="sm"
              className="fw-bold ms-2"
            >
              {translate('Agreement no:')} {customer.agreement_number}
            </Badge>
          )}
        </div>
      }
      verboseName={translate('Invoice items')}
      subtitle={
        translate('Record period') +
        ': ' +
        formatPeriod({ year: invoice.year, month: invoice.month })
      }
      hasQuery={true}
      minHeight="auto"
      tableActions={<InvoiceDetailActions invoice={invoice} />}
      expandableRowClassName="py-2 pe-2"
      expandableRow={({ row }) => (
        <InvoiceItemExpandableRow
          row={row}
          invoice={invoice}
          items={row.items}
          showPrice={showPrice}
          showVat={showVat}
          refresh={refreshInvoiceItems}
        />
      )}
      footer={footer}
    />
  );
};

import { FC, ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { invoicesItemsRetrieve } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { defaultCurrency } from '@/core/formatCurrency';
import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { PriceTooltip } from '@/price/PriceTooltip';
import { ResourceLink } from '@/resource/ResourceLink';
import { createFetcher } from '@/table/api';
import {
  InvoicesItemsFilter,
  selectInvoicesItemsFilter,
} from '@/table/generated/InvoicesItemsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

import { Invoice, InvoiceTableItem } from '../types';
import { formatPeriod } from '../utils';

import { InvoiceDetailActions } from './InvoiceDetailActions';
import { InvoiceItemExpandableRow } from './InvoiceItemExpandableRow';
import { InvoiceItemsBulkDelete } from './InvoiceItemsBulkDelete';
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

export const InvoiceItemsTable: FC<InvoiceItemsTableProps> = ({
  invoice,
  invoiceView,
  showPrice,
  showVat,
  footer,
  refreshInvoiceItems,
  setTotalFiltered,
}) => {
  const filter = useSelector(selectInvoicesItemsFilter);
  const customer = useSelector(getCustomer);
  const user = useUser();

  const fetchItems = useMemo(() => {
    return createFetcher(invoicesItemsRetrieve, {
      path: { uuid: invoice.uuid },
    });
  }, [invoice.uuid]);

  const tableProps = useTable({
    table: 'invoiceItems-' + invoice.uuid,
    fetchData: async (request) => {
      const response = await fetchItems(request);
      const rows = groupInvoiceItems(response.rows, request.filter?.o);

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
      filters={<InvoicesItemsFilter customerUuid={getUUID(invoice.customer)} />}
      columns={[
        {
          title: translate('Resource name'),
          render: ({ row }) => (
            <ResourceLink uuid={row.resource_uuid} label={row.resource_name} />
          ),
          orderField: 'resource_name',
        },
        {
          title: translate('Offering'),
          render: ({ row }) => <>{row.offering_name}</>,
          filter: 'offering',
          orderField: 'offering_name',
        },
        {
          title: translate('Project name'),
          render: ({ row }) => <>{row.project_name}</>,
          filter: 'project',
          orderField: 'project_name',
          inlineFilter: (row) => ({
            name: row.project_name,
            uuid: row.project_uuid,
          }),
        },
        {
          title: translate('Service provider'),
          render: ({ row }) => <>{row.service_provider_name}</>,
          filter: 'provider',
          orderField: 'service_provider_name',
          inlineFilter: (row) => ({
            customer_name: row.service_provider_name,
            uuid: row.service_provider_uuid,
          }),
        },
        {
          title: translate('Plan name'),
          render: ({ row }) => <>{row.plan_name}</>,
          orderField: 'plan_name',
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
              size="sm"
              pill
              outline
              className="fw-bold ms-2"
            >
              {translate('Agreement no:')} {customer.agreement_number}
            </Badge>
          )}
        </div>
      }
      verboseName={translate('Invoice items')}
      subtitle={translate('Record period: {period}', {
        period: formatPeriod({ year: invoice.year, month: invoice.month }),
      })}
      hasQuery={true}
      minHeight="auto"
      enableMultiSelect={user?.is_staff}
      multiSelectActions={InvoiceItemsBulkDelete}
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

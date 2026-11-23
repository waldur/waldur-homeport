import { useQuery } from '@tanstack/react-query';
import {
  invoiceItemsList,
  invoicesRetrieve,
  type Invoice,
  type InvoiceItemDetail,
  type Resource,
} from 'waldur-js-client';

import { AlertItem, Badge } from 'waldur-ui';

import { getAllPages } from '@/core/api';
import { formatDate, formatMonth, parseCalendarDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getInvoiceStateLabel } from '@/invoices/list/InvoicesFilterUtils';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { SimpleTable } from '@/table/SimpleTable';

import { getArrowLicense } from './arrowLicense';

type ItemKind = 'consumption' | 'adjustment' | 'billing_line' | 'import';

/** What put the item on the invoice, read from the details Arrow writes. */
export const getItemKind = (item: InvoiceItemDetail): ItemKind | null => {
  const details = (item.details ?? {}) as Record<string, unknown>;
  switch (details.source) {
    case 'arrow_consumption':
    case 'arrow_finalized':
      return 'consumption';
    case 'arrow_reconciliation':
      return 'adjustment';
    case 'arrow':
      // Billing-sync lines carry Arrow's line reference; imports the
      // vendor subscription they were created from.
      if (details.arrow_line_reference) {
        return 'billing_line';
      }
      return details.subscription_id ? 'import' : null;
    default:
      return null;
  }
};

const KIND_LABELS = (): Record<ItemKind, string> => ({
  consumption: translate('Consumption'),
  adjustment: translate('Adjustment'),
  billing_line: translate('Billing line'),
  import: translate('Import'),
});

const OPEN_STATES = ['pending', 'pending_finalization'];

const invoiceUuid = (url: string) =>
  url.replace(/\/+$/, '').split('/').pop() ?? '';

interface ItemRow {
  uuid: string;
  item: InvoiceItemDetail;
  invoice?: Pick<Invoice, 'uuid' | 'year' | 'month' | 'state'>;
}

const fetchItems = async (resourceUuid: string): Promise<ItemRow[]> => {
  const items = await getAllPages((page) =>
    invoiceItemsList({
      query: { resource_uuid: resourceUuid, page, page_size: 100 },
    }),
  );
  // An item's own dates need not be its invoice's month (an adjustment
  // lands on the current invoice), so read the month from the invoice.
  const uuids = Array.from(new Set(items.map((i) => invoiceUuid(i.invoice))));
  // An invoice that fails to load leaves its items listed without a month.
  const invoices = await Promise.allSettled(
    uuids.map((uuid) =>
      invoicesRetrieve({
        path: { uuid },
        query: { field: ['uuid', 'year', 'month', 'state'] },
      }).then((response) => response.data),
    ),
  );
  const byUuid = Object.fromEntries(
    invoices
      .filter((result) => result.status === 'fulfilled')
      .map((result) => [result.value.uuid, result.value]),
  );
  const monthKey = (row: ItemRow) =>
    row.invoice ? row.invoice.year * 100 + row.invoice.month : 0;
  return items
    .map((item) => ({
      uuid: item.uuid,
      item,
      invoice: byUuid[invoiceUuid(item.invoice)],
    }))
    .sort(
      (a, b) =>
        // Newest invoice first: the endpoint orders by the item's own start,
        // which need not be its invoice's month.
        monthKey(b) - monthKey(a) ||
        (b.item.start ?? '').localeCompare(a.item.start ?? ''),
    );
};

interface ViewInvoiceItemsDialogProps {
  resolve: { resource: Resource };
}

export const ViewInvoiceItemsDialog = ({
  resolve,
}: ViewInvoiceItemsDialogProps) => {
  const { resource } = resolve;
  const license = getArrowLicense(resource);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['arrow-resource-invoice-items', resource.uuid],
    queryFn: () => fetchItems(resource.uuid),
    // A failure is shown in the dialog, not by leaving the page.
    meta: { skipGlobalErrorRedirect: true },
  });
  const labels = KIND_LABELS();
  // A canceled invoice bills nothing.
  const total = (data ?? [])
    .filter((row) => row.invoice?.state !== 'canceled')
    .reduce((sum, row) => sum + Number(row.item.price), 0);

  return (
    <ModalDialog
      title={translate('Invoice items')}
      subtitle={
        <>
          <span className="font-medium">{resource.name}</span>
          {license && (
            <>
              {' '}
              <span className="text-quaternary">({license})</span>
            </>
          )}
        </>
      }
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <LoadingErred
          message={translate('Unable to load the invoice items.')}
          loadData={() => refetch()}
        />
      ) : !data?.length ? (
        <AlertItem
          type="floating"
          variant="info"
          title={translate('No invoice items for this resource yet.')}
          body={translate(
            'Items appear when consumption or billing is synced from Arrow, or when a license is imported.',
          )}
        />
      ) : (
        <>
          <div className="max-h-120 overflow-y-auto">
            <SimpleTable<ItemRow>
              rows={data}
              rowKey="uuid"
              columns={[
                {
                  title: translate('Invoice'),
                  render: ({ row }) => (
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        state="billingDetails"
                        params={{
                          uuid: row.item.customer_uuid,
                          invoice_uuid: invoiceUuid(row.item.invoice),
                        }}
                      >
                        {row.invoice
                          ? formatMonth(
                              new Date(row.invoice.year, row.invoice.month - 1),
                            )
                          : translate('Invoice')}
                      </Link>
                      {row.invoice && (
                        <Badge
                          variant={
                            OPEN_STATES.includes(row.invoice.state)
                              ? 'warning'
                              : 'neutral'
                          }
                          shape="pill"
                          tone="outline"
                        >
                          {getInvoiceStateLabel(row.invoice.state)}
                        </Badge>
                      )}
                    </div>
                  ),
                },
                {
                  title: translate('Item'),
                  render: ({ row }) => (
                    <>
                      {(row.item.details as Record<string, string>)
                        ?.offering_component_name || row.item.name}
                    </>
                  ),
                },
                {
                  title: translate('Kind'),
                  render: ({ row }) => {
                    const kind = getItemKind(row.item);
                    return kind ? (
                      <Badge variant="neutral" shape="pill" tone="outline">
                        {labels[kind]}
                      </Badge>
                    ) : (
                      <span className="text-quaternary">
                        {translate('Other')}
                      </span>
                    );
                  },
                },
                {
                  title: translate('Period'),
                  render: ({ row }) => (
                    <span className="whitespace-nowrap">
                      {formatDate(parseCalendarDate(row.item.start))} –{' '}
                      {formatDate(parseCalendarDate(row.item.end))}
                    </span>
                  ),
                },
                {
                  title: translate('Amount'),
                  render: ({ row }) => <>{defaultCurrency(row.item.price)}</>,
                },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 mt-3 font-medium">
            <span>{translate('Total, canceled invoices excluded')}:</span>
            <span>{defaultCurrency(total)}</span>
          </div>
        </>
      )}
    </ModalDialog>
  );
};

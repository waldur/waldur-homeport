import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  MinusIcon,
} from '@phosphor-icons/react';
import { FunctionComponent, useEffect, useMemo, useRef } from 'react';

import { Table as UITable, TableBody, TableCell, TableRow } from 'waldur-ui';

import { ENV } from '@/core/config';
import { formatMonth, parseDate } from '@/core/dateUtils';
import { formatCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { isAccountingMode } from '@/invoices/accountingMode';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { Customer } from '@/workspace/types';

import { groupInvoiceItems, isOpenInvoice } from '../details/utils';
import { Invoice } from '../types';
import { formatPeriod } from '../utils';

import { EstimatedCost } from './EstimatedCost';

interface MonthOverviewProps {
  invoice: Pick<
    Invoice,
    | 'uuid'
    | 'state'
    | 'month'
    | 'year'
    | 'invoice_date'
    | 'items'
    | 'price'
    | 'tax'
    | 'total'
  >;
  customer: Customer;
  costTrend?: -1 | 0 | 1;
  /** Reloads the month, from the card's refresh button. */
  refetch?: () => void;
}

// The header names the currency once, so the cells hold plain amounts.
const formatAmount = (value: string | number) =>
  formatCurrency(value, '', 2).trim();

export const MonthOverview: FunctionComponent<MonthOverviewProps> = ({
  invoice,
  customer,
  costTrend,
  refetch,
}) => {
  const isCurrentMonth = isOpenInvoice(invoice) && !invoice.invoice_date;
  const accountingMode = isAccountingMode();
  const maxProjectsShowCount = isCurrentMonth && !accountingMode ? 4 : 5;

  const allRows = useMemo(() => groupInvoiceItems(invoice.items), [invoice]);
  const rows = useMemo(
    () => allRows.slice(0, maxProjectsShowCount),
    [allRows, maxProjectsShowCount],
  );

  const showTotalSection =
    !isCurrentMonth && rows.length > 1 && Number(invoice.tax) > 0;

  const date = useMemo(
    () =>
      formatMonth(
        parseDate(formatPeriod({ year: invoice.year, month: invoice.month })),
      ),
    [invoice],
  );

  // The rows come with the invoice; the table shows whichever arrived last.
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const tableProps = useTable({
    table: `month-overview-${invoice.uuid}`,
    fetchData: () =>
      Promise.resolve({
        rows: rowsRef.current,
        resultCount: rowsRef.current.length,
      }),
  });
  const { fetch } = tableProps;
  useEffect(() => {
    fetch();
  }, [rows, fetch]);

  const totals = [
    !accountingMode && {
      label: translate('VAT'),
      value: invoice.tax,
    },
    { label: translate('Subtotal'), value: invoice.price },
    { label: translate('Total'), value: invoice.total },
  ].filter(Boolean);

  return (
    <Table
      {...tableProps}
      title={
        <span className="inline-flex items-center gap-1.5">
          {date}
          {isCurrentMonth && !accountingMode && (
            <span className="text-primary inline-flex">
              {costTrend === -1 ? (
                <ArrowDownIcon size={20} weight="bold" />
              ) : costTrend === 1 ? (
                <ArrowUpIcon size={20} weight="bold" />
              ) : (
                <MinusIcon size={20} weight="bold" />
              )}
            </span>
          )}
        </span>
      }
      subtitle={
        <span className="flex flex-wrap gap-x-3">
          <span>{translate('{count} records', { count: allRows.length })}</span>
          {isCurrentMonth && !accountingMode && <EstimatedCost />}
        </span>
      }
      verboseName={translate('Resources')}
      columns={[
        {
          title: translate('Resource'),
          render: ({ row }) =>
            row.resource_uuid ? (
              <Link
                state="marketplace-resource-details"
                params={{ resource_uuid: row.resource_uuid }}
                label={row.resource_name}
              />
            ) : (
              <>{row.resource_name}</>
            ),
        },
        {
          title: translate('Amount ({currency})', {
            currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
          }),
          render: ({ row }) => <>{formatAmount(row.total)}</>,
          className: 'text-end',
          // The header cell lays its label out in a flex row of its own.
          headerClassName: 'text-end [&>div]:justify-end',
        },
      ]}
      tableActions={
        <Link
          state="billingDetails"
          params={{
            uuid: customer.uuid,
            invoice_uuid: invoice.uuid,
          }}
          buttonVariant="tertiary"
        >
          <EyeIcon weight="bold" />
          {translate('View details')}
        </Link>
      }
      footer={
        showTotalSection && (
          <UITable
            scrollable={false}
            className="bg-secondary border-t border-t-secondary align-middle"
          >
            <TableBody>
              {totals.map((item) => (
                <TableRow
                  key={item.label}
                  hoverable={false}
                  className="text-sm font-medium"
                >
                  <TableCell className="text-end text-primary">
                    {item.label}:
                  </TableCell>
                  <TableCell
                    width="12%"
                    className="text-end text-primary whitespace-nowrap min-w-[150px]"
                  >
                    {formatAmount(item.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UITable>
        )
      }
      fetch={refetch ?? fetch}
      hasQuery={false}
      hasPagination={false}
      minHeight="auto"
      placeholderHasRetry={false}
    />
  );
};

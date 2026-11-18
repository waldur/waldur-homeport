import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';

import { Card, HelpIcon } from 'waldur-ui';

import { ENV } from '@/core/config';
import { formatDate } from '@/core/dateUtils';
import { defaultCurrency, formatCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getActiveFixedPricePaymentProfile } from '@/invoices/details/utils';
import {
  formatMonthCount,
  getPrepaidDurationMonths,
} from '@/marketplace/common/prepaidTotalDisplay';
import { PriceTooltip } from '@/price/PriceTooltip';
import { SimpleTable } from '@/table/SimpleTable';
import type { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { Component, PlanDetailsTableProps } from './types';

/** A component, or the total under the components. */
interface PlanRow {
  uuid: string;
  component?: Component;
  totals?: number[];
}

const unitPrice = (price: number) =>
  formatCurrency(price, ENV.plugins.WALDUR_CORE.CURRENCY_NAME, 4);

const toRows = (components: Component[], totals?: number[]): PlanRow[] => [
  ...components.map((component) => ({ uuid: component.type, component })),
  ...(totals ? [{ uuid: 'total', totals }] : []),
];

const nameColumn: Column<PlanRow> = {
  title: translate('Component name'),
  render: ({ row }) =>
    row.component ? (
      <>{row.component.name}</>
    ) : (
      <span className="font-semibold text-primary">{translate('Total')}</span>
    ),
};

const unitColumn: Column<PlanRow> = {
  title: translate('Unit'),
  render: ({ row }) =>
    row.component ? (
      <>{renderFieldOrDash(row.component.measured_unit)}</>
    ) : null,
};

const quantityColumn: Column<PlanRow> = {
  title: translate('Quantity'),
  render: ({ row }) => (row.component ? <>{row.component.amount}</> : null),
};

const unitPriceColumn: Column<PlanRow> = {
  title: (
    <>
      {translate('Price per unit')}
      <PriceTooltip />
    </>
  ),
  render: ({ row }) =>
    row.component ? <>{unitPrice(row.component.price)}</> : null,
};

/** Components billed per unit of usage, once, or on each plan switch. */
const PriceListTable = ({
  components,
  hidePrices,
}: {
  components: Component[];
  hidePrices: boolean;
}) => (
  <Card variant="table" bordered>
    <SimpleTable<PlanRow>
      columns={[
        nameColumn,
        unitColumn,
        ...(hidePrices ? [] : [unitPriceColumn]),
      ]}
      rows={toRows(components)}
    />
  </Card>
);

/** Components with a quantity, priced as quantity × unit price. */
const SubtotalTable = ({
  components,
  total,
  hidePrices,
}: {
  components: Component[];
  total: number;
  hidePrices: boolean;
}) => (
  <Card variant="table" bordered>
    <SimpleTable<PlanRow>
      columns={[
        nameColumn,
        unitColumn,
        quantityColumn,
        ...(hidePrices
          ? []
          : [
              unitPriceColumn,
              {
                title: translate('Subtotal'),
                render: ({ row }) => (
                  <>
                    {row.component
                      ? unitPrice(row.component.subTotal)
                      : unitPrice(row.totals[0])}
                  </>
                ),
              } as Column<PlanRow>,
            ]),
      ]}
      rows={toRows(components, hidePrices ? undefined : [total])}
    />
  </Card>
);

const Caption = ({ children }) => (
  <p className="text-quaternary mt-1.5 mb-3 text-xs">{children}</p>
);

export const PureDetailsTable: FunctionComponent<PlanDetailsTableProps> = (
  props,
) => {
  const customer = useCustomer();

  if (props.components.length === 0) {
    return null;
  }

  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);

  const fixedRows = props.components.filter(
    (component) => component.billing_type === 'fixed',
  );
  const usageRows = props.components.filter(
    (component) => component.billing_type === 'usage',
  );
  const initialRows = props.components.filter(
    (component) => component.billing_type === 'one' && !component.is_prepaid,
  );
  const prepaidRows = props.components.filter(
    (component) => component.billing_type === 'one' && component.is_prepaid,
  );
  const prepaidTotal = prepaidRows.reduce(
    (subTotal, component) => subTotal + component.subTotal,
    0,
  );
  const switchRows = props.components.filter(
    (component) => component.billing_type === 'few',
  );
  const limitedRows = props.components.filter(
    (component) => component.billing_type === 'limit',
  );
  const totalLimitedRows = limitedRows.filter(
    (component) => component.limit_period === 'total',
  );
  const otherLimitedRows = limitedRows.filter(
    (component) => component.limit_period !== 'total',
  );
  const totalLimitTotal = totalLimitedRows.reduce(
    (subTotal, component) => subTotal + component.subTotal,
    0,
  );
  const hasExtraRows = fixedRows.length > 0 || otherLimitedRows.length > 0;

  const hidePrices = Boolean(props.concealBillingInfo);
  const showPeriods = !activeFixedPriceProfile && !hidePrices;
  // Each table shares the dialog with the plan fields and its caption, so it
  // carries a border (Card).
  return (
    <div className={props.formGroupClassName}>
      <div className={props.columnClassName}>
        {hasExtraRows && (
          <Card variant="table" bordered className="mb-3">
            <SimpleTable<PlanRow>
              columns={[
                {
                  ...nameColumn,
                  render: ({ row }) =>
                    row.component ? (
                      <>
                        {row.component.name}{' '}
                        <HelpIcon label={row.component.type} />
                      </>
                    ) : (
                      <nameColumn.render row={row} />
                    ),
                },
                unitColumn,
                quantityColumn,
                ...(showPeriods
                  ? props.periods.map((period, index): Column<PlanRow> => ({
                      title: (
                        <>
                          {period}
                          <PriceTooltip />
                        </>
                      ),
                      render: ({ row }) => (
                        <>
                          {row.component
                            ? formatCurrency(
                                row.component.prices[index],
                                ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                                3,
                              )
                            : defaultCurrency(row.totals[index])}
                        </>
                      ),
                    }))
                  : []),
              ]}
              rows={toRows(
                [...fixedRows, ...otherLimitedRows],
                showPeriods ? props.totalPeriods : undefined,
              )}
            />
          </Card>
        )}
        {usageRows.length > 0 && (
          <>
            <PriceListTable components={usageRows} hidePrices={hidePrices} />
            <Caption>
              {hasExtraRows
                ? translate(
                    'Additionally service provider can charge for usage of the following components',
                  )
                : translate(
                    'Service provider can charge for usage of the following components',
                  )}
            </Caption>
          </>
        )}
        {totalLimitedRows.length > 0 && (
          <>
            <SubtotalTable
              components={totalLimitedRows}
              total={totalLimitTotal}
              hidePrices={hidePrices}
            />
            <Caption>
              {translate(
                'Fee applied according to the maximum value reported by service provider over the whole active state of resource.',
              )}
            </Caption>
          </>
        )}
        {initialRows.length > 0 && (
          <>
            <PriceListTable components={initialRows} hidePrices={hidePrices} />
            <Caption>
              {translate('A one-time fee applied on activation.')}
            </Caption>
          </>
        )}
        {prepaidRows.length > 0 && (
          <>
            <SubtotalTable
              components={prepaidRows}
              total={prepaidTotal}
              hidePrices={hidePrices}
            />
            <Caption>
              {props.startDate && props.endDate
                ? (() => {
                    // Counted as the period is billed, like the quantities
                    // above: a partial month rounds up, both in the period
                    // and in what is left of it. Nothing is left once it ends.
                    const totalMonths = getPrepaidDurationMonths(
                      props.startDate,
                      props.endDate,
                    );
                    const today = DateTime.now().toISODate();
                    const remainingMonths =
                      DateTime.fromISO(props.endDate) > DateTime.fromISO(today)
                        ? getPrepaidDurationMonths(today, props.endDate)
                        : 0;
                    return translate(
                      'Prepaid for {duration} ({startDate} — {endDate}). {remaining} remaining.',
                      {
                        duration: formatMonthCount(totalMonths),
                        startDate: formatDate(props.startDate),
                        endDate: formatDate(props.endDate),
                        remaining: formatMonthCount(remainingMonths),
                      },
                    );
                  })()
                : translate(
                    'Prepaid fee applied on activation based on ordered quantity and duration.',
                  )}
            </Caption>
          </>
        )}
        {switchRows.length > 0 && (
          <>
            <PriceListTable components={switchRows} hidePrices={hidePrices} />
            <Caption>
              {translate('Fee applied each time this plan is activated.')}
            </Caption>
          </>
        )}
      </div>
    </div>
  );
};

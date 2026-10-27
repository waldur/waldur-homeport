import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import {
  EarlierInvoiceMonth,
  ProjectCredit,
  projectCreditsEarlierInvoicesRetrieve,
} from 'waldur-js-client';

import { formatMonth } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

/** The months a credit pays earlier invoices for, as they stand in a form
 * that has not been saved yet; each bound may be empty. */
interface EarlierInvoicesPeriod {
  from?: string | null;
  until?: string | null;
}

const firstOfMonth = (date: string) => `${date.slice(0, 7)}-01`;

/** Whether the credit pays the month: by the period given, or else by the
 * credit's own, which the server says. */
const getInPeriod =
  (period: EarlierInvoicesPeriod | undefined) =>
  (month: EarlierInvoiceMonth) =>
    period
      ? (!period.from || month.period >= firstOfMonth(period.from)) &&
        (!period.until || month.period <= firstOfMonth(period.until))
      : month.in_period;

const EarlierInvoicesTable: FC<{
  credit: ProjectCredit;
  months: EarlierInvoiceMonth[];
  inPeriod: (month: EarlierInvoiceMonth) => boolean;
}> = ({ credit, months, inPeriod }) => {
  const tableProps = useTable({
    table: `project-credit-earlier-invoices-${credit.uuid}`,
    // Every closed month on one page: the pager is off, so a paginated
    // fetcher would show only its first page.
    fetchData: () =>
      Promise.resolve({ rows: months, resultCount: months.length }),
  });
  // The rows come from a separate query: fetch again when they arrive.
  useEffect(() => {
    tableProps.fetch();
  }, [months]);

  return (
    <Table<EarlierInvoiceMonth>
      {...tableProps}
      columns={[
        {
          title: translate('Month'),
          render: ({ row }) => <>{formatMonth(row.period)}</>,
        },
        {
          title: translate('Cost credit could pay'),
          render: ({ row }) => <>{defaultCurrency(row.cost)}</>,
        },
        {
          title: translate('Paid by credit'),
          render: ({ row }) => <>{defaultCurrency(row.covered)}</>,
        },
        {
          title: translate('Not covered'),
          render: ({ row }) =>
            Number(row.uncovered) > 0 ? (
              <>
                <span className="text-danger font-medium">
                  {defaultCurrency(row.uncovered)}
                </span>
                {inPeriod(row) ? null : (
                  <div className="text-xs text-tertiary">
                    {translate('Not paid by this credit')}
                  </div>
                )}
              </>
            ) : (
              <>{defaultCurrency(row.uncovered)}</>
            ),
        },
      ]}
      verboseName={translate('Earlier invoices')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
      // A short, bounded list: every closed month in one page, sized to it.
      hasPagination={false}
      cardBordered={false}
      bodyClassName="p-0"
      minHeight="auto"
    />
  );
};

/** What happens to the uncovered cost. `payable` is what the credit left now
 * could pay of it, null when this month's cost has used all of it. */
const getUncoveredText = (
  paying: boolean,
  isStaff: boolean,
  uncovered: string,
  payable: string | null,
) => {
  if (paying) {
    return payable
      ? translate(
          'This credit pays earlier invoices: {uncovered} is not covered yet, and {payable} of it can be paid from the credit left now. The rest is paid as credit becomes available.',
          { uncovered, payable },
        )
      : translate(
          'This credit pays earlier invoices: {uncovered} is not covered yet. This month’s cost uses all of the credit left now, so it is paid as credit becomes available.',
          { uncovered },
        );
  }
  if (isStaff) {
    return payable
      ? translate(
          '{uncovered} is not covered. Turning on “Pay earlier invoices” pays {payable} of it now, from the credit left.',
          { uncovered, payable },
        )
      : translate(
          '{uncovered} is not covered. This month’s cost uses all of the credit left now, so raise the allocation before turning on “Pay earlier invoices”, or it pays at the end of the month from what is left.',
          { uncovered },
        );
  }
  return payable
    ? translate(
        '{uncovered} is not covered. Support can let this credit pay earlier invoices; {payable} of it could be paid from the credit left now.',
        { uncovered, payable },
      )
    : translate(
        '{uncovered} is not covered. Support can let this credit pay earlier invoices, but this month’s cost uses all of the credit left now, so the allocation has to be raised first.',
        { uncovered },
      );
};

/** The project's closed months and what credit left uncovered of them.
 *
 * This is the cost a period-Total cost policy keeps counting: credit added now
 * pays only the current month. Shown to those who may see the project's
 * costs; for anyone else the request is refused and nothing is shown.
 */
/** The credit's earlier invoices; an error for whoever may not see the
 * project's costs. Shared by the table and the cost policy details,
 * so both read one request. */
export const useEarlierInvoices = (credit: ProjectCredit | null | undefined) =>
  useQuery({
    queryKey: [
      'ProjectCreditEarlierInvoices',
      credit?.uuid,
      credit?.value,
      credit?.pay_earlier_invoices,
      credit?.earlier_invoices_from,
      credit?.earlier_invoices_until,
    ],
    queryFn: () =>
      projectCreditsEarlierInvoicesRetrieve({
        path: { uuid: credit.uuid },
      }).then((response) => response.data),
    enabled: Boolean(credit?.uuid),
    retry: false,
    refetchOnWindowFocus: false,
  });

export const EarlierInvoices: FC<{
  credit: ProjectCredit;
  /** Leave out what can be done about the uncovered cost, where another
   * view says it (the cost policy's fix dialog). */
  hideAdvice?: boolean;
  /** The months the credit pays, from a form not saved yet; the credit's
   * own when left out. */
  period?: EarlierInvoicesPeriod;
}> = ({ credit, hideAdvice, period }) => {
  const user = useUser();
  const { data, isError } = useEarlierInvoices(credit);
  if (isError || !data) {
    return null;
  }
  const uncovered = Number(data.uncovered);
  // Uncovered cost in months the credit is set not to pay: it stays
  // uncovered however much credit there is.
  const outside = uncovered - Number(data.uncovered_in_period);
  const paidUncovered = credit.pay_earlier_invoices
    ? Number(data.uncovered_in_period)
    : uncovered;

  return (
    <div className="mt-6" data-testid="project-credit-earlier-invoices">
      <h3 className="text-lg font-semibold mb-2">
        {translate('Earlier invoices')}
      </h3>
      <p className="text-secondary mb-2">
        {translate(
          'Cost of closed months that credit did not cover. Credit added now pays only the current month, so a cost policy for the total period keeps counting this cost until it is paid.',
        )}
      </p>
      {uncovered > 0 && !hideAdvice ? (
        <p className="mb-3">
          {paidUncovered > 0
            ? getUncoveredText(
                credit.pay_earlier_invoices,
                Boolean(user?.is_staff),
                defaultCurrency(paidUncovered),
                Number(data.payable_now) > 0
                  ? defaultCurrency(data.payable_now)
                  : null,
              )
            : null}{' '}
          {outside > 0
            ? translate(
                '{outside} is in months outside “Earlier invoices from” and “Earlier invoices until”, which this credit does not pay.',
                { outside: defaultCurrency(outside) },
              )
            : null}
        </p>
      ) : null}
      <EarlierInvoicesTable
        credit={credit}
        months={data.months}
        inPeriod={getInPeriod(period)}
      />
    </div>
  );
};

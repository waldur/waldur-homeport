import { DateTime } from 'luxon';
import { FC } from 'react';
import { EarlierInvoiceMonth } from 'waldur-js-client';

import { formatMonth } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { CostPolicyFigures } from './costPolicyDetails';

interface MonthCell {
  key: string;
  label: string;
  /** The month's cost credit could pay, before credit. */
  cost: number;
  /** What credit did not cover; counted against the limit. */
  uncovered: number;
  current: boolean;
}

const cellClass = (cell: MonthCell) =>
  cell.uncovered > 0
    ? cell.current
      ? 'border-warning bg-warning-subtle'
      : 'border-danger bg-danger-subtle'
    : 'border-secondary bg-secondary';

/** Every month the policy counts, oldest first, each saying whether credit
 * covered it, and below them the sum the policy compares with its limit.
 *
 * The policy adds up only what credit did not cover, so a month credit paid
 * in full counts nothing; drawing those months too is what makes the sum
 * readable: it says why only some months appear in it.
 */
export const CostPolicyMonthStrip: FC<{
  figures: CostPolicyFigures;
  months: EarlierInvoiceMonth[];
  today?: DateTime;
}> = ({ figures, months, today = DateTime.now() }) => {
  const cells: MonthCell[] = [
    ...months.map((month) => ({
      key: month.period,
      label: formatMonth(month.period),
      cost: Number(month.cost),
      uncovered: Number(month.uncovered),
      current: false,
    })),
    {
      key: 'current',
      label: translate('{month} so far', {
        month: formatMonth(today.startOf('month').toISODate()),
      }),
      // Nothing is written for the open month yet: its cost so far is the
      // credit it will still draw plus what credit does not cover.
      cost: figures.pending + figures.thisMonth,
      uncovered: figures.thisMonth,
      current: true,
    },
  ];
  const counted = cells.filter((cell) => cell.uncovered > 0);
  const over = figures.current > figures.limit;
  const values = {
    parts: counted.map((cell) => defaultCurrency(cell.uncovered)).join(' + '),
    total: defaultCurrency(figures.current),
    limit: defaultCurrency(figures.limit),
  };

  return (
    <div data-testid="cost-policy-month-strip">
      <ol className="list-none ps-0 mb-3 flex flex-wrap gap-2">
        {cells.map((cell) => (
          <li
            key={cell.key}
            className={`rounded-md border-[1px] px-3 py-2 min-w-[120px] ${cellClass(cell)}`}
          >
            <div className="text-xs text-secondary">{cell.label}</div>
            <div className="text-sm">
              {translate('Cost {cost}', { cost: defaultCurrency(cell.cost) })}
            </div>
            <div
              className={
                cell.uncovered > 0
                  ? cell.current
                    ? 'font-medium text-warning'
                    : 'font-medium text-danger'
                  : 'text-quaternary'
              }
            >
              {cell.uncovered > 0
                ? translate('{amount} not covered', {
                    amount: defaultCurrency(cell.uncovered),
                  })
                : translate('Covered by credit')}
            </div>
          </li>
        ))}
      </ol>
      <p className="mb-0">
        {counted.length === 0
          ? translate(
              'Credit covered every month, so the policy counts nothing against its {limit} limit.',
              { limit: defaultCurrency(figures.limit) },
            )
          : counted.length === 1
            ? // One month: a sum of one part reads "€600.00 = €600.00".
              over
              ? translate(
                  'The policy counts what credit did not cover: {total} in {month}, over the {limit} limit.',
                  { ...values, month: counted[0].label },
                )
              : translate(
                  'The policy counts what credit did not cover: {total} in {month}, at or below the {limit} limit.',
                  { ...values, month: counted[0].label },
                )
            : over
              ? translate(
                  'The policy adds up what credit did not cover: {parts} = {total}, over the {limit} limit.',
                  values,
                )
              : translate(
                  'The policy adds up what credit did not cover: {parts} = {total}, at or below the {limit} limit.',
                  values,
                )}
      </p>
    </div>
  );
};

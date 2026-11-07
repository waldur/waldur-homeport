import { FC } from 'react';
import { ResourcePoolCell, ResourcePoolUsage } from 'waldur-js-client';

import { WarningTip } from 'waldur-ui';

import { translate } from '@/i18n';
import { formatAmount } from '@/proposals/budgets';

interface PoolCellProps {
  row: ResourcePoolUsage;
  cell: ResourcePoolCell;
  /** The whole call's pool of the component, for a round's cell. */
  wholeCallTotal?: number | string | null;
}

/**
 * One cell of the pools matrix, on one line: what the pool offers, with a
 * warning when it is overdrawn or above the whole call's. What was requested,
 * awarded and remains is in the row's details; the pool is edited from the
 * row's menu.
 */
export const PoolCell: FC<PoolCellProps> = ({ row, cell, wholeCallTotal }) => {
  const unit = row.measured_unit;
  // An award draws on its round's pool and on the whole call's, and must fit
  // both: a round never awards more than the call's pool.
  const aboveWholeCall =
    Boolean(cell.round_uuid && cell.pool_uuid) &&
    wholeCallTotal !== null &&
    wholeCallTotal !== undefined &&
    Number(cell.offered_total) > Number(wholeCallTotal);
  const overdrawn = cell.remaining !== null && cell.remaining < 0;

  return (
    <span className="flex items-center gap-1.5" data-testid="pool-cell">
      <span className={cell.pool_uuid ? undefined : 'text-quaternary'}>
        {cell.pool_uuid
          ? formatAmount(cell.offered_total, unit)
          : translate('No pool')}
      </span>
      {overdrawn && (
        <WarningTip
          label={translate('Overdrawn: {remaining} remaining.', {
            remaining: formatAmount(cell.remaining),
          })}
        />
      )}
      {aboveWholeCall && (
        <WarningTip
          label={translate(
            'More than the whole call’s pool of {total}: at most that can be awarded in this round.',
            { total: formatAmount(wholeCallTotal, unit) },
          )}
        />
      )}
    </span>
  );
};

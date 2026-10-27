import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Table } from 'react-bootstrap';

import { AccordionCard } from 'waldur-ui';

import { translate } from '@/i18n';

import type { TransactionStats } from './api';
import { formatNumber, formatPercent, getRollbackHealth } from './utils';

interface DatabaseTransactionsCardProps {
  data: TransactionStats;
}

export const DatabaseTransactionsCard: FC<DatabaseTransactionsCardProps> = ({
  data,
}) => {
  const rollbackHealth = getRollbackHealth(data.rollback_ratio_percent);
  const hasDeadlocks = data.deadlocks > 0;

  return (
    <AccordionCard
      id="database-transactions"
      title={translate('Transactions')}
      subtitle={translate('{total} committed, {rollback}% rollback rate', {
        total: formatNumber(data.committed),
        rollback: data.rollback_ratio_percent.toFixed(2),
      })}
      defaultOpen={rollbackHealth !== 'success' || hasDeadlocks}
      className="mb-5"
    >
      <Table
        size="sm"
        borderless
        className="mb-0"
        style={{ maxWidth: '400px' }}
      >
        <tbody>
          <tr>
            <td className="text-quaternary">{translate('Committed')}</td>
            <td className="text-end text-success">
              {formatNumber(data.committed)}
            </td>
          </tr>
          <tr>
            <td className="text-quaternary">{translate('Rolled back')}</td>
            <td className="text-end">{formatNumber(data.rolled_back)}</td>
          </tr>
          <tr>
            <td className="text-quaternary">{translate('Rollback ratio')}</td>
            <td
              className={`text-end ${rollbackHealth === 'danger' ? 'text-danger' : rollbackHealth === 'warning' ? 'text-warning' : ''}`}
            >
              {formatPercent(data.rollback_ratio_percent)}
            </td>
          </tr>
          <tr>
            <td className="text-quaternary">
              <div className="flex items-center">
                {translate('Deadlocks')}
                {hasDeadlocks && (
                  <WarningCircleIcon
                    size={16}
                    weight="bold"
                    className="text-danger ms-1.5"
                  />
                )}
              </div>
            </td>
            <td className={`text-end ${hasDeadlocks ? 'text-danger' : ''}`}>
              {data.deadlocks}
            </td>
          </tr>
        </tbody>
      </Table>
      {hasDeadlocks && (
        <small className="text-danger mt-2.5 block">
          {translate(
            'Deadlocks detected! Review concurrent transaction patterns.',
          )}
        </small>
      )}
    </AccordionCard>
  );
};

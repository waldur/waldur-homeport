import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { AccordionCard } from 'waldur-ui';

import { translate } from '@/i18n';

import type { MaintenanceStats } from './api';
import { formatNumber, formatPercent, getDeadTupleHealth } from './utils';

interface DatabaseMaintenanceCardProps {
  data: MaintenanceStats;
}

const TRANSACTION_AGE_WARNING = 1000000000; // 1 billion XIDs

export const DatabaseMaintenanceCard: FC<DatabaseMaintenanceCardProps> = ({
  data,
}) => {
  const deadTupleHealth = getDeadTupleHealth(data.dead_tuple_ratio_percent);
  const hasTransactionAgeWarning =
    data.oldest_transaction_age != null &&
    data.oldest_transaction_age > TRANSACTION_AGE_WARNING;
  const needsAttention =
    deadTupleHealth !== 'success' ||
    hasTransactionAgeWarning ||
    data.tables_needing_vacuum > 0;

  return (
    <AccordionCard
      id="database-maintenance"
      title={translate('Maintenance')}
      subtitle={translate('Vacuum and tuple statistics')}
      defaultOpen={needsAttention}
      className="mb-5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5">
        <div>
          <h6 className="uppercase text-quaternary mb-2.5">
            {translate('Tuple statistics')}
          </h6>
          <table className="table table-sm table-borderless mb-0">
            <tbody>
              <tr>
                <td className="text-quaternary">{translate('Live tuples')}</td>
                <td className="text-end">
                  {formatNumber(data.total_live_tuples)}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Dead tuples')}</td>
                <td className="text-end">
                  {formatNumber(data.total_dead_tuples)}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Dead tuple ratio')}
                </td>
                <td
                  className={`text-end ${deadTupleHealth === 'danger' ? 'text-danger' : deadTupleHealth === 'warning' ? 'text-warning' : ''}`}
                >
                  {formatPercent(data.dead_tuple_ratio_percent)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h6 className="uppercase text-quaternary mb-2.5">
            {translate('Vacuum status')}
          </h6>
          <table className="table table-sm table-borderless mb-0">
            <tbody>
              <tr>
                <td className="text-quaternary">
                  {translate('Tables needing vacuum')}
                </td>
                <td
                  className={`text-end ${data.tables_needing_vacuum > 0 ? 'text-warning' : ''}`}
                >
                  {data.tables_needing_vacuum}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  <div className="flex items-center">
                    {translate('Oldest transaction age')}
                    {hasTransactionAgeWarning && (
                      <WarningCircleIcon
                        size={16}
                        weight="bold"
                        className="text-danger ms-1.5"
                      />
                    )}
                  </div>
                </td>
                <td
                  className={`text-end ${hasTransactionAgeWarning ? 'text-danger' : ''}`}
                >
                  {data.oldest_transaction_age != null
                    ? formatNumber(data.oldest_transaction_age)
                    : '-'}
                </td>
              </tr>
            </tbody>
          </table>
          {hasTransactionAgeWarning && (
            <small className="text-danger mt-1.5 block">
              {translate(
                'Transaction ID wraparound risk! Run vacuum on large tables.',
              )}
            </small>
          )}
        </div>
      </div>
    </AccordionCard>
  );
};

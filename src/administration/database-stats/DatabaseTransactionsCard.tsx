import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { AccordionCard, PropertyList, PropertyItem } from 'waldur-ui';

import { formatCount } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import type { TransactionStats } from './api';
import { getRollbackHealth } from './utils';

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
        total: formatCount(data.committed),
        rollback: data.rollback_ratio_percent.toFixed(2),
      })}
      defaultOpen={rollbackHealth !== 'success' || hasDeadlocks}
      className="mb-5"
    >
      <PropertyList variant="compact" className="max-w-[400px]">
        <PropertyItem
          label={translate('Committed')}
          value={propVal.count(data.committed)}
          valueClass="text-success"
        />
        <PropertyItem
          label={translate('Rolled back')}
          value={propVal.count(data.rolled_back)}
        />
        <PropertyItem
          label={translate('Rollback ratio')}
          value={propVal.percent(data.rollback_ratio_percent)}
          valueClass={
            rollbackHealth === 'danger'
              ? 'text-danger'
              : rollbackHealth === 'warning'
                ? 'text-warning'
                : undefined
          }
        />
        <PropertyItem
          label={
            <>
              {translate('Deadlocks')}
              {hasDeadlocks && (
                <WarningCircleIcon
                  size={16}
                  weight="bold"
                  className="text-danger ms-1.5"
                />
              )}
            </>
          }
          value={propVal.number(data.deadlocks)}
          valueClass={hasDeadlocks ? 'text-danger' : undefined}
        />
      </PropertyList>
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

import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { AccordionCard, PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import type { MaintenanceStats } from './api';
import { getDeadTupleHealth } from './utils';

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
      <PropertyList
        variant="compact"
        className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 lg:gap-x-12"
      >
        <PropertyList.Section title={translate('Tuple statistics')}>
          <PropertyItem
            label={translate('Live tuples')}
            value={propVal.count(data.total_live_tuples)}
          />
          <PropertyItem
            label={translate('Dead tuples')}
            value={propVal.count(data.total_dead_tuples)}
          />
          <PropertyItem
            label={translate('Dead tuple ratio')}
            value={propVal.percent(data.dead_tuple_ratio_percent)}
            valueClass={
              deadTupleHealth === 'danger'
                ? 'text-danger'
                : deadTupleHealth === 'warning'
                  ? 'text-warning'
                  : undefined
            }
          />
        </PropertyList.Section>
        <PropertyList.Section
          title={translate('Vacuum status')}
          description={
            hasTransactionAgeWarning ? (
              <span className="text-danger">
                {translate(
                  'Transaction ID wraparound risk! Run vacuum on large tables.',
                )}
              </span>
            ) : undefined
          }
        >
          <PropertyItem
            label={translate('Tables needing vacuum')}
            value={propVal.number(data.tables_needing_vacuum)}
            valueClass={
              data.tables_needing_vacuum > 0 ? 'text-warning' : undefined
            }
          />
          <PropertyItem
            label={
              <>
                {translate('Oldest transaction age')}
                {hasTransactionAgeWarning && (
                  <WarningCircleIcon
                    size={16}
                    weight="bold"
                    className="text-danger ms-1.5"
                  />
                )}
              </>
            }
            value={propVal.number(data.oldest_transaction_age)}
            valueClass={hasTransactionAgeWarning ? 'text-danger' : undefined}
          />
        </PropertyList.Section>
      </PropertyList>
    </AccordionCard>
  );
};

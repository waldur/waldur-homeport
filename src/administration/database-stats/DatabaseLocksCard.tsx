import { FC } from 'react';

import { AccordionCard, Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import type { LockStats } from './api';
import { getLocksHealth } from './utils';

interface DatabaseLocksCardProps {
  data: LockStats;
}

export const DatabaseLocksCard: FC<DatabaseLocksCardProps> = ({ data }) => {
  const health = getLocksHealth(data.waiting_locks);
  const hasExclusiveLocks = data.access_exclusive_locks > 0;

  return (
    <AccordionCard
      id="database-locks"
      title={translate('Locks')}
      subtitle={translate('{total} locks held, {waiting} waiting', {
        total: data.total_locks,
        waiting: data.waiting_locks,
      })}
      defaultOpen={health !== 'success' || hasExclusiveLocks}
      className="mb-5"
    >
      <PropertyList variant="compact" className="max-w-[400px]">
        <PropertyItem
          label={translate('Total locks')}
          value={propVal.count(data.total_locks)}
        />
        <PropertyItem
          label={translate('Waiting locks')}
          value={
            data.waiting_locks > 0 ? (
              <Badge
                variant={health === 'danger' ? 'danger' : 'warning'}
                shape="pill"
                tone="outline"
              >
                {data.waiting_locks}
              </Badge>
            ) : (
              <span className="text-success">0</span>
            )
          }
        />
        <PropertyItem
          label={translate('Access exclusive locks')}
          value={
            data.access_exclusive_locks > 0 ? (
              <Badge variant="warning" shape="pill" tone="outline">
                {data.access_exclusive_locks}
              </Badge>
            ) : (
              '0'
            )
          }
        />
      </PropertyList>
      {hasExclusiveLocks && (
        <small className="text-warning mt-2.5 block">
          {translate(
            'Access exclusive locks block all other access. This may indicate DDL operations or maintenance in progress.',
          )}
        </small>
      )}
    </AccordionCard>
  );
};

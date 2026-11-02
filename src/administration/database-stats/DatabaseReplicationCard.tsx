import { FC } from 'react';

import { AccordionCard, PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import type { ReplicationStats } from './api';

interface DatabaseReplicationCardProps {
  data: ReplicationStats;
}

export const DatabaseReplicationCard: FC<DatabaseReplicationCardProps> = ({
  data,
}) => {
  const hasReplicationLag =
    data.is_replica &&
    data.replication_lag_bytes != null &&
    data.replication_lag_bytes > 0;

  return (
    <AccordionCard
      id="database-replication"
      title={translate('Replication')}
      subtitle={
        data.is_replica
          ? translate('This is a replica database')
          : translate('This is the primary database')
      }
      defaultOpen={hasReplicationLag}
      className="mb-5"
    >
      <PropertyList variant="compact" className="max-w-[400px]">
        <PropertyItem
          label={translate('Role')}
          value={propVal.boolean(data.is_replica, {
            wording: [translate('Replica'), translate('Primary')],
            display: 'badge',
            variants: ['info', 'primary'],
          })}
        />
        {!data.is_replica && data.wal_bytes != null && (
          <PropertyItem
            label={translate('WAL size')}
            value={propVal.fileSize(data.wal_bytes)}
          />
        )}
        {data.is_replica && (
          <PropertyItem
            label={translate('Replication lag')}
            value={propVal.fileSize(data.replication_lag_bytes)}
            placeholder={translate('No lag')}
            hideIfEmpty={false}
            valueClass={hasReplicationLag ? 'text-warning' : 'text-success'}
          />
        )}
      </PropertyList>
      {hasReplicationLag && (
        <small className="text-warning mt-2.5 block">
          {translate(
            'Replica is behind primary. Check network connectivity and primary load.',
          )}
        </small>
      )}
    </AccordionCard>
  );
};

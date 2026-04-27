import { FC } from 'react';
import { Table } from 'react-bootstrap';

import { AccordionCard } from '@/core/AccordionCard';
import { Badge } from '@/core/Badge';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';

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
      className="mb-6"
    >
      <Table
        size="sm"
        borderless
        className="mb-0"
        style={{ maxWidth: '400px' }}
      >
        <tbody>
          <tr>
            <td className="text-muted">{translate('Role')}</td>
            <td className="text-end">
              <Badge
                variant={data.is_replica ? 'info' : 'primary'}
                pill
                outline
              >
                {data.is_replica ? translate('Replica') : translate('Primary')}
              </Badge>
            </td>
          </tr>
          {!data.is_replica && data.wal_bytes != null && (
            <tr>
              <td className="text-muted">{translate('WAL size')}</td>
              <td className="fw-semibold text-end">
                {formatFilesize(data.wal_bytes, 'B')}
              </td>
            </tr>
          )}
          {data.is_replica && (
            <tr>
              <td className="text-muted">{translate('Replication lag')}</td>
              <td
                className={`fw-semibold text-end ${hasReplicationLag ? 'text-warning' : 'text-success'}`}
              >
                {data.replication_lag_bytes != null
                  ? formatFilesize(data.replication_lag_bytes, 'B')
                  : translate('No lag')}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {hasReplicationLag && (
        <small className="text-warning mt-3 d-block">
          {translate(
            'Replica is behind primary. Check network connectivity and primary load.',
          )}
        </small>
      )}
    </AccordionCard>
  );
};

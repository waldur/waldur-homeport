import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';

import type { DatabaseStatsResponse } from './api';
import {
  formatDuration,
  formatPercent,
  getCacheHealth,
  getConnectionHealth,
  getDeadTupleHealth,
  getLocksHealth,
  getQueryDurationHealth,
  HealthLevel,
} from './utils';

interface DatabaseOverviewCardsProps {
  data: DatabaseStatsResponse;
}

const getTextClass = (health: HealthLevel): string => {
  switch (health) {
    case 'danger':
      return 'text-danger';
    case 'warning':
      return 'text-warning';
    default:
      return 'text-success';
  }
};

export const DatabaseOverviewCards: FC<DatabaseOverviewCardsProps> = ({
  data,
}) => {
  const connectionHealth = getConnectionHealth(
    data.connections.utilization_percent,
  );
  const cacheHealth = getCacheHealth(
    data.cache_performance.buffer_cache_hit_ratio,
  );
  const deadTupleHealth = getDeadTupleHealth(
    data.maintenance.dead_tuple_ratio_percent,
  );
  const locksHealth = getLocksHealth(data.locks.waiting_locks);
  const queryHealth = getQueryDurationHealth(
    data.active_queries.longest_duration_seconds,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 mb-5">
      <div>
        <Card className="card-bordered mb-4">
          <Card.Body>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <strong
                  className={`display-4 ${getTextClass(connectionHealth)}`}
                >
                  {data.connections.utilization_percent.toFixed(0)}%
                </strong>
                {connectionHealth !== 'success' && (
                  <WarningCircleIcon
                    size={24}
                    weight="bold"
                    className={getTextClass(connectionHealth) + ' ms-1.5'}
                  />
                )}
              </div>
              <span className="text-quaternary">
                {data.connections.active + data.connections.idle} /{' '}
                {data.connections.max_connections}
              </span>
            </div>
            <strong className="block">
              {translate('Connection utilization')}
            </strong>
          </Card.Body>
        </Card>
      </div>

      <div>
        <Card className="card-bordered mb-4">
          <Card.Body>
            <div className="flex items-center">
              <strong className={`display-4 ${getTextClass(cacheHealth)}`}>
                {formatPercent(data.cache_performance.buffer_cache_hit_ratio)}
              </strong>
              {cacheHealth !== 'success' && (
                <WarningCircleIcon
                  size={24}
                  weight="bold"
                  className={getTextClass(cacheHealth) + ' ms-1.5'}
                />
              )}
            </div>
            <strong className="block">{translate('Cache hit ratio')}</strong>
          </Card.Body>
        </Card>
      </div>

      <div>
        <Card className="card-bordered mb-4">
          <Card.Body>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <strong
                  className={`display-4 ${getTextClass(deadTupleHealth)}`}
                >
                  {formatPercent(data.maintenance.dead_tuple_ratio_percent)}
                </strong>
                {deadTupleHealth !== 'success' && (
                  <WarningCircleIcon
                    size={24}
                    weight="bold"
                    className={getTextClass(deadTupleHealth) + ' ms-1.5'}
                  />
                )}
              </div>
              {data.maintenance.tables_needing_vacuum > 0 && (
                <span className="text-warning">
                  {translate('{count} need vacuum', {
                    count: data.maintenance.tables_needing_vacuum,
                  })}
                </span>
              )}
            </div>
            <strong className="block">{translate('Dead tuple ratio')}</strong>
          </Card.Body>
        </Card>
      </div>

      <div>
        <Card className="card-bordered mb-4">
          <Card.Body>
            <div className="flex items-center">
              <strong className={`display-4 ${getTextClass(locksHealth)}`}>
                {data.locks.waiting_locks}
              </strong>
              {locksHealth !== 'success' && (
                <WarningCircleIcon
                  size={24}
                  weight="bold"
                  className={getTextClass(locksHealth) + ' ms-1.5'}
                />
              )}
            </div>
            <strong className="block">{translate('Waiting locks')}</strong>
          </Card.Body>
        </Card>
      </div>

      <div>
        <Card className="card-bordered mb-4">
          <Card.Body>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <strong className={`display-4 ${getTextClass(queryHealth)}`}>
                  {data.active_queries.count}
                </strong>
                {queryHealth !== 'success' && (
                  <WarningCircleIcon
                    size={24}
                    weight="bold"
                    className={getTextClass(queryHealth) + ' ms-1.5'}
                  />
                )}
              </div>
              {data.active_queries.longest_duration_seconds > 0 && (
                <span className={getTextClass(queryHealth)}>
                  {translate('Longest: {duration}', {
                    duration: formatDuration(
                      data.active_queries.longest_duration_seconds,
                    ),
                  })}
                </span>
              )}
            </div>
            <strong className="block">{translate('Active queries')}</strong>
          </Card.Body>
        </Card>
      </div>

      <div>
        <Card className="card-bordered mb-4">
          <Card.Body>
            <div className="flex items-center justify-between">
              <strong className="display-4 text-info">
                {formatFilesize(data.database_size.total_size_bytes, 'B')}
              </strong>
              <span className="text-quaternary">
                {data.database_size.database_name}
              </span>
            </div>
            <strong className="block">{translate('Database size')}</strong>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

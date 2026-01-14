import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

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
    <Row className="mb-6">
      <Col md={6} lg={4}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <strong
                  className={`display-4 ${getTextClass(connectionHealth)}`}
                >
                  {data.connections.utilization_percent.toFixed(0)}%
                </strong>
                {connectionHealth !== 'success' && (
                  <WarningCircleIcon
                    size={24}
                    weight="bold"
                    className={getTextClass(connectionHealth) + ' ms-2'}
                  />
                )}
              </div>
              <span className="text-muted">
                {data.connections.active + data.connections.idle} /{' '}
                {data.connections.max_connections}
              </span>
            </div>
            <strong className="d-block">
              {translate('Connection utilization')}
            </strong>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={4}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center">
              <strong className={`display-4 ${getTextClass(cacheHealth)}`}>
                {formatPercent(data.cache_performance.buffer_cache_hit_ratio)}
              </strong>
              {cacheHealth !== 'success' && (
                <WarningCircleIcon
                  size={24}
                  weight="bold"
                  className={getTextClass(cacheHealth) + ' ms-2'}
                />
              )}
            </div>
            <strong className="d-block">{translate('Cache hit ratio')}</strong>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={4}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <strong
                  className={`display-4 ${getTextClass(deadTupleHealth)}`}
                >
                  {formatPercent(data.maintenance.dead_tuple_ratio_percent)}
                </strong>
                {deadTupleHealth !== 'success' && (
                  <WarningCircleIcon
                    size={24}
                    weight="bold"
                    className={getTextClass(deadTupleHealth) + ' ms-2'}
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
            <strong className="d-block">{translate('Dead tuple ratio')}</strong>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={4}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center">
              <strong className={`display-4 ${getTextClass(locksHealth)}`}>
                {data.locks.waiting_locks}
              </strong>
              {locksHealth !== 'success' && (
                <WarningCircleIcon
                  size={24}
                  weight="bold"
                  className={getTextClass(locksHealth) + ' ms-2'}
                />
              )}
            </div>
            <strong className="d-block">{translate('Waiting locks')}</strong>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={4}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <strong className={`display-4 ${getTextClass(queryHealth)}`}>
                  {data.active_queries.count}
                </strong>
                {queryHealth !== 'success' && (
                  <WarningCircleIcon
                    size={24}
                    weight="bold"
                    className={getTextClass(queryHealth) + ' ms-2'}
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
            <strong className="d-block">{translate('Active queries')}</strong>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={4}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <strong className="display-4 text-info">
                {formatFilesize(data.database_size.total_size_bytes, 'B')}
              </strong>
              <span className="text-muted">
                {data.database_size.database_name}
              </span>
            </div>
            <strong className="d-block">{translate('Database size')}</strong>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

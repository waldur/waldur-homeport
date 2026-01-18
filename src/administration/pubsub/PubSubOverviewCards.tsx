import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import type { PubsubOverview } from './api';
import {
  formatCircuitBreakerState,
  formatNumber,
  getCircuitBreakerLevel,
  getHealthStatusLevel,
  getSuccessRateLevel,
  getTextClass,
} from './utils';

interface PubSubOverviewCardsProps {
  data: PubsubOverview;
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'healthy':
      return translate('Healthy');
    case 'degraded':
      return translate('Degraded');
    case 'critical':
      return translate('Critical');
    default:
      return status;
  }
};

export const PubSubOverviewCards: FC<PubSubOverviewCardsProps> = ({ data }) => {
  const healthLevel = getHealthStatusLevel(data.health_status);
  const circuitBreakerLevel = getCircuitBreakerLevel(
    data.circuit_breaker.state,
  );
  const failureRateLevel = getSuccessRateLevel(data.metrics.failure_rate);

  return (
    <Row className="mb-6">
      <Col md={6} lg={3}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center">
              <strong className={`display-4 ${getTextClass(healthLevel)}`}>
                {getStatusLabel(data.health_status)}
              </strong>
              {healthLevel !== 'success' && (
                <WarningCircleIcon
                  size={24}
                  weight="bold"
                  className={getTextClass(healthLevel) + ' ms-2'}
                />
              )}
            </div>
            <strong className="d-block">{translate('Health status')}</strong>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={3}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center">
              <strong
                className={`display-4 ${getTextClass(circuitBreakerLevel)}`}
              >
                {formatCircuitBreakerState(data.circuit_breaker.state)}
              </strong>
              {circuitBreakerLevel !== 'success' && (
                <WarningCircleIcon
                  size={24}
                  weight="bold"
                  className={getTextClass(circuitBreakerLevel) + ' ms-2'}
                />
              )}
            </div>
            <strong className="d-block">
              {translate('Circuit breaker state')}
            </strong>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={3}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <strong
                  className={`display-4 ${getTextClass(failureRateLevel)}`}
                >
                  {data.metrics.failure_rate}
                </strong>
                {failureRateLevel !== 'success' && (
                  <WarningCircleIcon
                    size={24}
                    weight="bold"
                    className={getTextClass(failureRateLevel) + ' ms-2'}
                  />
                )}
              </div>
              <span className="text-muted">
                {formatNumber(data.metrics.messages_sent)} {translate('sent')}
              </span>
            </div>
            <strong className="d-block">{translate('Failure rate')}</strong>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={3}>
        <Card className="card-bordered mb-5">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <strong className="display-4 text-info">
                {formatNumber(data.metrics.messages_failed)}
              </strong>
              <span className="text-muted">
                {translate('avg {ms}ms', { ms: data.metrics.avg_latency_ms })}
              </span>
            </div>
            <strong className="d-block">{translate('Messages failed')}</strong>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

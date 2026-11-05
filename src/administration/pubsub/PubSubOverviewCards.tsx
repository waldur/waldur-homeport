import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Card, CardContent } from 'waldur-ui';

import { formatCount } from '@/core/formatNumber';
import { translate } from '@/i18n';

import type { PubsubOverview } from './api';
import {
  formatCircuitBreakerState,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 mb-5">
      <div>
        <Card bordered className="mb-4">
          <CardContent>
            <div className="flex items-center">
              <strong className={`display-4 ${getTextClass(healthLevel)}`}>
                {getStatusLabel(data.health_status)}
              </strong>
              {healthLevel !== 'success' && (
                <WarningCircleIcon
                  size={24}
                  weight="bold"
                  className={getTextClass(healthLevel) + ' ms-1.5'}
                />
              )}
            </div>
            <strong className="block">{translate('Health status')}</strong>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card bordered className="mb-4">
          <CardContent>
            <div className="flex items-center">
              <strong
                className={`display-4 ${getTextClass(circuitBreakerLevel)}`}
              >
                {formatCircuitBreakerState(data.circuit_breaker.state)}
              </strong>
              {circuitBreakerLevel !== 'success' && (
                <WarningCircleIcon
                  size={24}
                  weight="bold"
                  className={getTextClass(circuitBreakerLevel) + ' ms-1.5'}
                />
              )}
            </div>
            <strong className="block">
              {translate('Circuit breaker state')}
            </strong>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card bordered className="mb-4">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <strong
                  className={`display-4 ${getTextClass(failureRateLevel)}`}
                >
                  {data.metrics.failure_rate}
                </strong>
                {failureRateLevel !== 'success' && (
                  <WarningCircleIcon
                    size={24}
                    weight="bold"
                    className={getTextClass(failureRateLevel) + ' ms-1.5'}
                  />
                )}
              </div>
              <span className="text-quaternary">
                {formatCount(data.metrics.messages_sent)} {translate('sent')}
              </span>
            </div>
            <strong className="block">{translate('Failure rate')}</strong>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card bordered className="mb-4">
          <CardContent>
            <div className="flex items-center justify-between">
              <strong className="display-4 text-info">
                {formatCount(data.metrics.messages_failed)}
              </strong>
              <span className="text-quaternary">
                {translate('avg {ms}ms', { ms: data.metrics.avg_latency_ms })}
              </span>
            </div>
            <strong className="block">{translate('Messages failed')}</strong>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

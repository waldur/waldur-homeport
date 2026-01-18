import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col, Row, Table } from 'react-bootstrap';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { Badge } from '@waldur/core/Badge';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { getCircuitBreaker } from './api';
import {
  formatCircuitBreakerState,
  formatTimestamp,
  getCircuitBreakerLevel,
  HealthLevel,
} from './utils';

interface PubSubCircuitBreakerCardProps {
  currentState: string;
}

const getBadgeVariant = (
  health: HealthLevel,
): 'success' | 'warning' | 'danger' => {
  return health;
};

export const PubSubCircuitBreakerCard: FC<PubSubCircuitBreakerCardProps> = ({
  currentState,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['PubSubCircuitBreaker'],
    queryFn: getCircuitBreaker,
    staleTime: 30000,
  });

  const health = getCircuitBreakerLevel(currentState);
  const needsAttention = currentState !== 'closed';

  return (
    <AccordionCard
      id="pubsub-circuit-breaker"
      title={translate('Circuit breaker')}
      subtitle={formatCircuitBreakerState(currentState)}
      defaultOpen={needsAttention}
      className="mb-6"
    >
      {isLoading ? (
        <div className="text-center py-4">
          <LoadingSpinner />
        </div>
      ) : data ? (
        <Row>
          <Col lg={6}>
            <h6 className="text-uppercase text-muted mb-3">
              {translate('Current state')}
            </h6>
            <Table size="sm" borderless className="mb-0">
              <tbody>
                <tr>
                  <td className="text-muted">{translate('State')}</td>
                  <td className="text-end">
                    <Badge variant={getBadgeVariant(health)} outline>
                      {formatCircuitBreakerState(data.state)}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">{translate('Failure count')}</td>
                  <td className="fw-semibold text-end">{data.failure_count}</td>
                </tr>
                <tr>
                  <td className="text-muted">{translate('Success count')}</td>
                  <td className="fw-semibold text-end">{data.success_count}</td>
                </tr>
                <tr>
                  <td className="text-muted">{translate('Last failure')}</td>
                  <td className="fw-semibold text-end">
                    {formatTimestamp(data.last_failure_time)}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">
                    {translate('Last state change')}
                  </td>
                  <td className="fw-semibold text-end">
                    {formatTimestamp(data.last_state_change)}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">
                    {translate('Failure threshold')}
                  </td>
                  <td className="fw-semibold text-end">
                    {data.config.failure_threshold}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">
                    {translate('Recovery timeout')}
                  </td>
                  <td className="fw-semibold text-end">
                    {data.config.recovery_timeout}s
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col lg={6}>
            <h6 className="text-uppercase text-muted mb-3">
              {translate('State history')}
            </h6>
            {data.state_history && data.state_history.length > 0 ? (
              <Table size="sm" borderless className="mb-0">
                <thead>
                  <tr>
                    <th className="text-muted">{translate('Time')}</th>
                    <th className="text-muted">{translate('Transition')}</th>
                    <th className="text-muted">{translate('Reason')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.state_history.slice(0, 10).map((transition, index) => (
                    <tr key={index}>
                      <td className="text-nowrap">
                        {formatTimestamp(transition.timestamp)}
                      </td>
                      <td>
                        {transition.from_state && (
                          <>
                            <span className="text-muted">
                              {formatCircuitBreakerState(transition.from_state)}
                            </span>
                            <span className="mx-1">&rarr;</span>
                          </>
                        )}
                        <Badge
                          variant={getBadgeVariant(
                            getCircuitBreakerLevel(transition.to_state),
                          )}
                          size="sm"
                          outline
                        >
                          {formatCircuitBreakerState(transition.to_state)}
                        </Badge>
                      </td>
                      <td
                        className="text-muted text-truncate"
                        title={transition.reason}
                      >
                        {transition.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-muted mb-0">
                {translate('No state transitions recorded.')}
              </p>
            )}
          </Col>
        </Row>
      ) : (
        <p className="text-muted mb-0">
          {translate('Failed to load circuit breaker details.')}
        </p>
      )}
    </AccordionCard>
  );
};

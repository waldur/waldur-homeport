import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { AccordionCard, Badge } from 'waldur-ui';

import { FAST_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

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
    staleTime: FAST_STALE_TIME,
  });

  const health = getCircuitBreakerLevel(currentState);
  const needsAttention = currentState !== 'closed';

  return (
    <AccordionCard
      id="pubsub-circuit-breaker"
      title={translate('Circuit breaker')}
      subtitle={formatCircuitBreakerState(currentState)}
      defaultOpen={needsAttention}
      className="mb-5"
    >
      {isLoading ? (
        <div className="text-center py-3">
          <LoadingSpinner />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5">
          <div>
            <h6 className="uppercase text-quaternary mb-2.5">
              {translate('Current state')}
            </h6>
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                <tr>
                  <td className="text-quaternary">{translate('State')}</td>
                  <td className="text-end">
                    <Badge variant={getBadgeVariant(health)} tone="outline">
                      {formatCircuitBreakerState(data.state)}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Failure count')}
                  </td>
                  <td className="text-end">{data.failure_count}</td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Success count')}
                  </td>
                  <td className="text-end">{data.success_count}</td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Last failure')}
                  </td>
                  <td className="text-end">
                    {formatTimestamp(data.last_failure_time)}
                  </td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Last state change')}
                  </td>
                  <td className="text-end">
                    {formatTimestamp(data.last_state_change)}
                  </td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Failure threshold')}
                  </td>
                  <td className="text-end">{data.config.failure_threshold}</td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Recovery timeout')}
                  </td>
                  <td className="text-end">{data.config.recovery_timeout}s</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h6 className="uppercase text-quaternary mb-2.5">
              {translate('State history')}
            </h6>
            {data.state_history && data.state_history.length > 0 ? (
              <table className="table table-sm table-borderless mb-0">
                <thead>
                  <tr>
                    <th className="text-quaternary">{translate('Time')}</th>
                    <th className="text-quaternary">
                      {translate('Transition')}
                    </th>
                    <th className="text-quaternary">{translate('Reason')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.state_history.slice(0, 10).map((transition, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap">
                        {formatTimestamp(transition.timestamp)}
                      </td>
                      <td>
                        {transition.from_state && (
                          <>
                            <span className="text-quaternary">
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
                          tone="outline"
                        >
                          {formatCircuitBreakerState(transition.to_state)}
                        </Badge>
                      </td>
                      <td
                        className="text-quaternary truncate"
                        title={transition.reason}
                      >
                        {transition.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-quaternary mb-0">
                {translate('No state transitions recorded.')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-quaternary mb-0">
          {translate('Failed to load circuit breaker details.')}
        </p>
      )}
    </AccordionCard>
  );
};

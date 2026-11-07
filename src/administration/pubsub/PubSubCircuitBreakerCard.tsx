import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import {
  AccordionCard,
  Badge,
  PropertyItem,
  PropertyList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { FAST_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

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
            <PropertyList variant="compact">
              <PropertyList.Section title={translate('Current state')}>
                <PropertyItem
                  label={translate('State')}
                  value={
                    <Badge variant={getBadgeVariant(health)} tone="outline">
                      {formatCircuitBreakerState(data.state)}
                    </Badge>
                  }
                />
                <PropertyItem
                  label={translate('Failure count')}
                  value={propVal.number(data.failure_count)}
                />
                <PropertyItem
                  label={translate('Success count')}
                  value={propVal.number(data.success_count)}
                />
                <PropertyItem
                  label={translate('Last failure')}
                  value={propVal.date(data.last_failure_time, {
                    epoch: true,
                    precision: 'datetime',
                  })}
                />
                <PropertyItem
                  label={translate('Last state change')}
                  value={propVal.date(data.last_state_change, {
                    epoch: true,
                    precision: 'datetime',
                  })}
                />
                <PropertyItem
                  label={translate('Failure threshold')}
                  value={propVal.number(data.config.failure_threshold)}
                />
                <PropertyItem
                  label={translate('Recovery timeout')}
                  value={propVal.duration(data.config.recovery_timeout)}
                />
              </PropertyList.Section>
            </PropertyList>
          </div>
          <div>
            <h6 className="uppercase text-quaternary mb-2.5">
              {translate('State history')}
            </h6>
            {data.state_history && data.state_history.length > 0 ? (
              <Table density="compact" className="mb-0">
                <TableHeader>
                  <TableRow divided={false} hoverable={false}>
                    <TableHead className="text-quaternary">
                      {translate('Time')}
                    </TableHead>
                    <TableHead className="text-quaternary">
                      {translate('Transition')}
                    </TableHead>
                    <TableHead className="text-quaternary">
                      {translate('Reason')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.state_history.slice(0, 10).map((transition, index) => (
                    <TableRow key={index} divided={false} hoverable={false}>
                      <TableCell className="whitespace-nowrap">
                        {formatTimestamp(transition.timestamp)}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell
                        className="text-quaternary truncate"
                        title={transition.reason}
                      >
                        {transition.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

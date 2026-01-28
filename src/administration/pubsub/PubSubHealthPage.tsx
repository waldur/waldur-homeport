import { WarningCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/common/RefreshButton';

import { getPubSubOverview } from './api';
import { EventSubscriptionQueuesCard } from './EventSubscriptionQueuesCard';
import { PubSubCircuitBreakerCard } from './PubSubCircuitBreakerCard';
import { PubSubCircuitBreakerResetButton } from './PubSubCircuitBreakerResetButton';
import { PubSubDeadLetterQueueCard } from './PubSubDeadLetterQueueCard';
import { PubSubIssuesCard } from './PubSubIssuesCard';
import { PubSubMetricsCard } from './PubSubMetricsCard';
import { PubSubMetricsResetButton } from './PubSubMetricsResetButton';
import { PubSubOverviewCards } from './PubSubOverviewCards';
import { PubSubTopQueuesCard } from './PubSubTopQueuesCard';

export const PubSubHealthPage = () => {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['PubSubOverview'],
    queryFn: getPubSubOverview,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading || !data) {
    return (
      <Panel title={translate('PubSub publishing health')} cardBordered>
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="text-muted mt-4">
            {translate('Fetching PubSub health status, please standby...')}
          </p>
        </div>
      </Panel>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const is503 = errorMessage.includes('503');

    return (
      <Panel title={translate('PubSub publishing health')} cardBordered>
        <Alert variant="danger" className="d-flex align-items-center mb-0">
          <WarningCircleIcon size={24} weight="bold" className="me-3" />
          <div>
            <strong>
              {is503
                ? translate('PubSub service unavailable')
                : translate('Failed to load PubSub health status')}
            </strong>
            <p className="mb-0 mt-1">
              {is503
                ? translate(
                    'The PubSub debug API is not responding. Please check that the backend service is running.',
                  )
                : errorMessage}
            </p>
          </div>
        </Alert>
      </Panel>
    );
  }

  const panelActions = (
    <div className="d-flex align-items-center gap-4">
      <RefreshButton refetch={refetch} isLoading={isRefetching} />
      <PubSubCircuitBreakerResetButton
        currentState={data.circuit_breaker.state}
      />
      <PubSubMetricsResetButton />
    </div>
  );

  return (
    <Panel
      title={translate('PubSub publishing health')}
      actions={panelActions}
      cardBordered
    >
      <PubSubOverviewCards data={data} />
      <PubSubIssuesCard issues={data.issues} />
      <PubSubCircuitBreakerCard currentState={data.circuit_breaker.state} />
      <PubSubMetricsCard />
      <PubSubDeadLetterQueueCard />
      <PubSubTopQueuesCard />
      <EventSubscriptionQueuesCard />
    </Panel>
  );
};

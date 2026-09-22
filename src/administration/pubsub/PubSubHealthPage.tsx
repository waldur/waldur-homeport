import { useQuery } from '@tanstack/react-query';

import { AlertItem } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { RefreshButton } from '@/marketplace/common/RefreshButton';

import { getPubSubOverview } from './api';
import { EventConsumersCard } from './EventConsumersCard';
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
        <AlertItem
          variant="error"
          type="floating"
          title={
            is503
              ? translate('PubSub service unavailable')
              : translate('Failed to load PubSub health status')
          }
          body={
            is503
              ? translate(
                  'The PubSub debug API is not responding. Please check that the backend service is running.',
                )
              : errorMessage
          }
        />
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
      <EventConsumersCard />
      <EventSubscriptionQueuesCard />
    </Panel>
  );
};

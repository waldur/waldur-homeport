import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { AlertItem } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { RefreshButton } from '@/marketplace/common/RefreshButton';
import { TableWithPortal } from '@/table/types';

import { TabToolbar } from '../TabToolbar';

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

export const PubSubHealthPage: FC<Partial<TableWithPortal>> = ({ portal }) => {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['PubSubOverview'],
    queryFn: getPubSubOverview,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading || !data) {
    return (
      <div className="pt-5">
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="text-muted mt-4">
            {translate('Fetching PubSub health status, please standby...')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const is503 = errorMessage.includes('503');

    return (
      <div className="pt-5">
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
      </div>
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
    <div className="pt-5">
      <TabToolbar portal={portal}>{panelActions}</TabToolbar>
      <PubSubOverviewCards data={data} />
      <PubSubIssuesCard issues={data.issues} />
      <PubSubCircuitBreakerCard currentState={data.circuit_breaker.state} />
      <PubSubMetricsCard />
      <PubSubDeadLetterQueueCard />
      <PubSubTopQueuesCard />
      <EventConsumersCard />
      <EventSubscriptionQueuesCard />
    </div>
  );
};

import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';

import {
  AccordionCard,
  AlertItem,
  Badge,
  BaseButton,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import {
  getRabbitMQOverview,
  type RmqMessageStats,
  type RmqObjectTotals,
  type RmqOverview,
  type RmqQueueTotals,
} from './api';

interface RabbitMQClusterOverviewContentProps {
  data: RmqOverview;
}

const RabbitMQClusterOverviewContent: FC<
  RabbitMQClusterOverviewContentProps
> = ({ data }) => {
  const objectTotals: Partial<RmqObjectTotals> = data.object_totals || {};
  const queueTotals: Partial<RmqQueueTotals> = data.queue_totals || {};
  const messageStats: Partial<RmqMessageStats> = data.message_stats || {};
  const unacknowledged = queueTotals.messages_unacknowledged ?? 0;

  return (
    <PropertyList
      variant="compact"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <PropertyList.Section title={translate('Cluster & runtime')}>
        <PropertyItem
          label={translate('Cluster name')}
          value={data.cluster_name}
          hasCopy
        />
        <PropertyItem
          label={translate('Node')}
          value={propVal.code(data.node, { truncate: 'middle' })}
          hasCopy
        />
        <PropertyItem
          label={translate('RabbitMQ version')}
          value={data.rabbitmq_version}
        />
        <PropertyItem
          label={translate('Erlang version')}
          value={data.erlang_version}
        />
        {data.listeners && data.listeners.length > 0 && (
          <PropertyItem
            label={translate('Listeners')}
            value={
              <div className="flex flex-wrap gap-1 justify-end">
                {data.listeners.map((listener, idx) => (
                  <Badge
                    key={`${listener.protocol}-${listener.port}-${idx}`}
                    variant="neutral"
                    tone="outline"
                    className="font-mono text-xs"
                  >
                    {listener.protocol}:{listener.port}
                  </Badge>
                ))}
              </div>
            }
          />
        )}
      </PropertyList.Section>

      <PropertyList.Section title={translate('Activity & throughput')}>
        <PropertyItem
          label={translate('Publish rate')}
          value={propVal.number(messageStats.publish_rate ?? 0, {
            fractionDigits: 1,
            unit: '/s',
          })}
        />
        <PropertyItem
          label={translate('Deliver rate')}
          value={propVal.number(messageStats.deliver_rate ?? 0, {
            fractionDigits: 1,
            unit: '/s',
          })}
        />
        <PropertyItem
          label={translate('Acknowledge rate')}
          value={propVal.number(messageStats.ack_rate ?? 0, {
            fractionDigits: 1,
            unit: '/s',
          })}
        />
        <PropertyItem
          label={translate('Confirm rate')}
          value={propVal.number(messageStats.confirm_rate ?? 0, {
            fractionDigits: 1,
            unit: '/s',
          })}
        />
      </PropertyList.Section>

      <PropertyList.Section title={translate('Object totals')}>
        <PropertyItem
          label={translate('Connections')}
          value={propVal.count(objectTotals.connections)}
        />
        <PropertyItem
          label={translate('Channels')}
          value={propVal.count(objectTotals.channels)}
        />
        <PropertyItem
          label={translate('Exchanges')}
          value={propVal.count(objectTotals.exchanges)}
        />
        <PropertyItem
          label={translate('Queues')}
          value={propVal.count(objectTotals.queues)}
        />
        <PropertyItem
          label={translate('Consumers')}
          value={propVal.count(objectTotals.consumers)}
        />
      </PropertyList.Section>

      <PropertyList.Section title={translate('Queue totals')}>
        <PropertyItem
          label={translate('Total messages')}
          value={propVal.count(queueTotals.messages)}
        />
        <PropertyItem
          label={translate('Ready')}
          value={propVal.count(queueTotals.messages_ready)}
        />
        <PropertyItem
          label={translate('Unacknowledged')}
          value={
            unacknowledged > 0 ? (
              <span className="text-warning font-semibold">
                {unacknowledged.toLocaleString()}
              </span>
            ) : (
              0
            )
          }
        />
      </PropertyList.Section>
    </PropertyList>
  );
};

const RabbitMQClusterOverviewSkeleton: FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="space-y-3">
        <div className="h-4 bg-tertiary rounded-lg w-1/2 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-tertiary rounded-lg w-full" />
          <div className="h-3 bg-tertiary rounded-lg w-3/4" />
          <div className="h-3 bg-tertiary rounded-lg w-5/6" />
          <div className="h-3 bg-tertiary rounded-lg w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

export const RabbitMQClusterOverview: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['RabbitMQOverview'],
    queryFn: getRabbitMQOverview,
    enabled: isOpen,
    refetchInterval: isOpen ? 30000 : false,
  });

  const is503 = error
    ? (error instanceof Error ? error.message : String(error)).includes('503')
    : false;

  const cardActions = (
    <div className="flex items-center gap-2">
      {data && (
        <Badge variant="neutral" tone="outline" className="font-mono text-xs">
          RabbitMQ {data.rabbitmq_version}
        </Badge>
      )}
      {isRefetching && (
        <LoadingSpinnerSimple size={14} className="text-quaternary" />
      )}
    </div>
  );

  return (
    <AccordionCard
      id="rabbitmq-cluster-overview"
      title={translate('Cluster overview')}
      subtitle={translate('RabbitMQ cluster health and configuration details')}
      isOpen={isOpen}
      onToggle={setIsOpen}
      actions={cardActions}
      className="mb-5"
    >
      {isLoading && <RabbitMQClusterOverviewSkeleton />}
      {error && (
        <AlertItem
          variant="error"
          type="floating"
          title={
            is503
              ? translate('RabbitMQ service unavailable')
              : translate('Failed to load cluster overview')
          }
          body={
            is503
              ? translate(
                  'The RabbitMQ management API is not responding. Please check that RabbitMQ is running.',
                )
              : error instanceof Error
                ? error.message
                : String(error)
          }
          actions={
            <BaseButton
              variant="tertiary"
              size="sm"
              label={translate('Retry')}
              onClick={() => refetch()}
            />
          }
        />
      )}
      {data && <RabbitMQClusterOverviewContent data={data} />}
    </AccordionCard>
  );
};

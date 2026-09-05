import { FC, useMemo } from 'react';

import { Link } from '@/core/Link';
import { StateIndicator } from '@/core/StateIndicator';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { useAgentByQueueName } from '../site-agents/useAgentConnectionStats';

import type { RmqQueueStats, RmqVhostStats } from './api';
import { QueueKindBadge } from './QueueKindBadge';
import { RabbitMQQueueActions } from './RabbitMQQueueActions';
import { RabbitMQQueueConfigPopover } from './RabbitMQQueueConfigPopover';
import { RabbitMQQueueHealthBadge } from './RabbitMQQueueHealthBadge';

interface RabbitMQVhostExpandableRowProps {
  row: RmqVhostStats;
}

export const RabbitMQVhostExpandableRow: FC<
  RabbitMQVhostExpandableRowProps
> = ({ row }) => {
  const user = useUser();
  const isStaff = user?.is_staff;
  const {
    agentByQueue,
    isError: agentsUnavailable,
    isLoading: agentsLoading,
  } = useAgentByQueueName();
  // x-queue-type is only set on queues that declare it, so the column is worth
  // a place only when at least one of them does.
  const hasRmqQueueType = row.queues.some((queue) => !!queue.queue_type);

  const tableProps = useTable({
    table: `RabbitMQQueues-${row.name}`,
    fetchData: createClientPaginatedFetcher(row.queues),
  });

  const columns = useMemo(
    () =>
      [
        {
          title: translate('Queue name'),
          render: ({ row: queue }: { row: RmqQueueStats }) => (
            // consumer_<uuid> (41 chars) stays on one line; the much longer
            // legacy subscription_* names wrap instead of widening the table.
            <code
              className={
                queue.queue_kind === 'consumer'
                  ? 'fs-8 text-nowrap'
                  : 'fs-8 text-break'
              }
              title={queue.name}
            >
              {queue.name}
            </code>
          ),
          copyField: (queue: RmqQueueStats) => queue.name,
          ellipsis: false,
        },
        {
          title: translate('Kind'),
          render: ({ row: queue }: { row: RmqQueueStats }) => (
            <QueueKindBadge kind={queue.queue_kind} id={queue.name} />
          ),
        },
        {
          title: translate('Object type'),
          render: ({ row: queue }: { row: RmqQueueStats }) =>
            renderFieldOrDash(queue.object_type),
        },
        hasRmqQueueType && {
          title: translate('Queue type'),
          render: ({ row: queue }: { row: RmqQueueStats }) => {
            const queueType = queue.queue_type;
            if (!queueType) return renderFieldOrDash(queueType);
            const variant =
              queueType === 'quorum'
                ? 'primary'
                : queueType === 'stream'
                  ? 'info'
                  : 'secondary';
            return (
              <StateIndicator
                label={queueType}
                variant={variant}
                pill
                outline={queueType === 'classic'}
              />
            );
          },
        },
        {
          title: translate('Messages'),
          render: ({ row: queue }: { row: RmqQueueStats }) => (
            <span className="fw-bold">{queue.messages.toLocaleString()}</span>
          ),
        },
        {
          title: translate('Ready'),
          render: ({ row: queue }: { row: RmqQueueStats }) =>
            queue.messages_ready.toLocaleString(),
        },
        {
          title: translate('Unacked'),
          render: ({ row: queue }: { row: RmqQueueStats }) =>
            queue.messages_unacknowledged.toLocaleString(),
        },
        {
          title: translate('Consumers'),
          render: ({ row: queue }: { row: RmqQueueStats }) => (
            <span
              className={queue.consumers > 0 ? 'text-success' : 'text-danger'}
            >
              {queue.consumers}
            </span>
          ),
        },
        {
          title: translate('Status'),
          render: ({ row: queue }: { row: RmqQueueStats }) => (
            <RabbitMQQueueHealthBadge queue={queue} />
          ),
        },
        {
          title: translate('Config'),
          render: ({ row: queue }: { row: RmqQueueStats }) => (
            <RabbitMQQueueConfigPopover queue={queue} />
          ),
        },
        {
          title: translate('Consumer / subscription'),
          render: ({ row: queue }: { row: RmqQueueStats }) => {
            const consumerUuid = queue.consumer_uuid;
            const owner = consumerUuid ? agentByQueue.get(queue.name) : null;
            if (consumerUuid) {
              return (
                <Tip
                  label={
                    owner
                      ? translate(
                          'Consumer queue registered by site agent {name}',
                          {
                            name: owner.agentName,
                          },
                        )
                      : agentsLoading
                        ? translate('Loading site agent data...')
                        : agentsUnavailable
                          ? translate('Site agent connection data unavailable')
                          : translate('Not owned by a site agent')
                  }
                  id={`queue-consumer-${queue.name}`}
                >
                  <span className="text-primary">
                    {consumerUuid.substring(0, 8)}...
                  </span>
                </Tip>
              );
            }
            return queue.subscription_uuid
              ? renderFieldOrDash(
                  <span className="text-info">
                    {queue.subscription_uuid.substring(0, 8)}...
                  </span>,
                )
              : renderFieldOrDash(queue.subscription_uuid);
          },
          copyField: (queue: RmqQueueStats) =>
            queue.consumer_uuid || queue.subscription_uuid || '',
        },
        {
          title: translate('Offering'),
          render: ({ row: queue }: { row: RmqQueueStats }) => {
            const owner = agentByQueue.get(queue.name);
            const offeringUuid = queue.offering_uuid || owner?.offeringUuid;
            if (!offeringUuid) return renderFieldOrDash(offeringUuid);
            return (
              <Link
                state="admin-marketplace-offering-details"
                params={{ offering_uuid: offeringUuid }}
              >
                {owner?.offeringName ?? `${offeringUuid.substring(0, 8)}...`}
              </Link>
            );
          },
          copyField: (queue: RmqQueueStats) =>
            queue.offering_uuid ||
            agentByQueue.get(queue.name)?.offeringUuid ||
            '',
        },
      ].filter(Boolean),
    [agentByQueue, agentsUnavailable, agentsLoading, hasRmqQueueType],
  );

  if (row.queues.length === 0) {
    return (
      <ExpandableContainer>
        <p className="text-muted">{translate('No queues in this vhost')}</p>
      </ExpandableContainer>
    );
  }

  return (
    <ExpandableContainer>
      <Table<RmqQueueStats>
        {...tableProps}
        columns={columns}
        verboseName={translate('queues')}
        hasActionBar={false}
        hoverShadow={false}
        initialPageSize={10}
        minHeight="auto"
        rowActions={
          isStaff
            ? ({ row: queue }) => (
                <RabbitMQQueueActions vhost={row.name} queue={queue} />
              )
            : undefined
        }
      />
    </ExpandableContainer>
  );
};

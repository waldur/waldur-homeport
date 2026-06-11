import { FC, useMemo } from 'react';

import { Link } from '@/core/Link';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import type { RmqQueueStats, RmqVhostStats } from './api';
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

  const tableProps = useTable({
    table: `RabbitMQQueues-${row.name}`,
    fetchData: createClientPaginatedFetcher(row.queues),
  });

  const columns = useMemo(
    () => [
      {
        title: translate('Queue name'),
        render: ({ row: queue }: { row: RmqQueueStats }) => (
          <code className="fs-8" title={queue.name}>
            {queue.name.length > 40
              ? `${queue.name.substring(0, 40)}...`
              : queue.name}
          </code>
        ),
        copyField: (queue: RmqQueueStats) => queue.name,
      },
      {
        title: translate('Type'),
        render: ({ row: queue }: { row: RmqQueueStats }) =>
          renderFieldOrDash(queue.object_type),
      },
      {
        title: translate('Queue type'),
        render: ({ row: queue }: { row: RmqQueueStats }) => {
          if (!queue.queue_type) return <span className="text-muted">-</span>;
          const isClassic =
            queue.queue_type !== 'quorum' && queue.queue_type !== 'stream';
          const variant =
            queue.queue_type === 'quorum'
              ? 'primary'
              : queue.queue_type === 'stream'
                ? 'info'
                : 'secondary';
          return (
            <StateIndicator
              label={queue.queue_type}
              variant={variant}
              pill
              outline={isClassic}
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
        title: translate('Subscription'),
        render: ({ row: queue }: { row: RmqQueueStats }) =>
          queue.subscription_uuid ? (
            <span className="text-info">
              {queue.subscription_uuid.substring(0, 8)}...
            </span>
          ) : (
            <span className="text-muted">-</span>
          ),
        copyField: (queue: RmqQueueStats) => queue.subscription_uuid || '',
      },
      {
        title: translate('Offering'),
        render: ({ row: queue }: { row: RmqQueueStats }) =>
          queue.offering_uuid ? (
            <Link
              state="admin-marketplace-offering-details"
              params={{ offering_uuid: queue.offering_uuid }}
            >
              {queue.offering_uuid.substring(0, 8)}...
            </Link>
          ) : (
            <span className="text-muted">-</span>
          ),
        copyField: (queue: RmqQueueStats) => queue.offering_uuid || '',
      },
    ],
    [],
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

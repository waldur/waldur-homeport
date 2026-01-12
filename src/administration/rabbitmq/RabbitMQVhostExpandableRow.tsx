import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

import type { RmqQueueStats, RmqVhostStats } from './api';
import { RabbitMQQueueActions } from './RabbitMQQueueActions';
import { RabbitMQQueueHealthBadge } from './RabbitMQQueueHealthBadge';

interface RabbitMQVhostExpandableRowProps {
  row: RmqVhostStats;
}

export const RabbitMQVhostExpandableRow: FC<
  RabbitMQVhostExpandableRowProps
> = ({ row }) => {
  const isStaff = useSelector(isStaffSelector);

  const tableProps = useTable({
    table: `RabbitMQQueues-${row.name}`,
    fetchData: () =>
      Promise.resolve({
        rows: row.queues,
        resultCount: row.queues.length,
      }),
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
          queue.object_type || '-',
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

import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import { EventConsumer, eventConsumersList } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { Badge } from '@/core/Badge';
import { FAST_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { getRabbitMQStats } from '../rabbitmq/api';
import { getConsumerQueueName } from '../rabbitmq/utils';

import { EventConsumerRowActions } from './EventConsumerRowActions';

// object_types is a JSONField on the backend, so the schema types it as an
// object; at runtime it is always a list of observable object type names.
const getObjectTypes = (row: EventConsumer): string[] =>
  Array.isArray(row.object_types) ? (row.object_types as string[]) : [];

interface QueueStats {
  messages: number;
  consumers: number;
}

const useConsumerQueueStats = (enabled: boolean) => {
  const { data, isError } = useQuery({
    queryKey: ['RabbitMQStats'],
    queryFn: getRabbitMQStats,
    staleTime: FAST_STALE_TIME,
    retry: false,
    enabled,
  });
  const byQueue = useMemo(() => {
    const byQueue = new Map<string, QueueStats>();
    for (const vhost of data?.vhosts ?? []) {
      for (const queue of vhost.queues) {
        byQueue.set(queue.name, {
          messages: queue.messages,
          consumers: queue.consumers,
        });
      }
    }
    return byQueue;
  }, [data]);
  return { byQueue, statsUnavailable: isError };
};

const ObjectTypesCell: FC<{ row: EventConsumer }> = ({ row }) => {
  const types = getObjectTypes(row);
  if (types.length === 0) {
    return (
      <Badge variant="secondary" pill outline>
        {translate('All types')}
      </Badge>
    );
  }
  // Compact comma list; the cell ellipsis + hover title expose the full set.
  return <span className="fs-8">{types.join(', ')}</span>;
};

const ScopesCell: FC<{ row: EventConsumer }> = ({ row }) => {
  if (row.is_global) {
    return (
      <Tip
        label={translate(
          'Bound to no scope: receives every event in the system, including events about all users.',
        )}
        id={`consumer-global-${row.uuid}`}
      >
        <Badge variant="danger" pill outline>
          {translate('Global')}
        </Badge>
      </Tip>
    );
  }
  return (
    <div className="d-flex flex-wrap gap-1">
      {row.scopes.map((scope, index) => (
        <code key={index} className="fs-8">
          {scope.type}:{scope.uuid?.substring(0, 8)}
        </code>
      ))}
    </div>
  );
};

const EventConsumersTable: FC = () => {
  const tableProps = useTable({
    table: 'EventConsumers',
    fetchData: createFetcher(eventConsumersList),
  });
  const { byQueue: queueStats, statsUnavailable } = useConsumerQueueStats(true);

  const columns = useMemo(
    () => [
      {
        title: translate('Consumer'),
        render: ({ row }: { row: EventConsumer }) => (
          <code className="fs-8">{row.uuid.substring(0, 8)}...</code>
        ),
        copyField: (row: EventConsumer) => row.uuid,
      },
      {
        title: translate('Object types'),
        render: ObjectTypesCell,
      },
      {
        title: translate('Scopes'),
        render: ScopesCell,
      },
      {
        title: translate('Queue'),
        render: ({ row }: { row: EventConsumer }) =>
          row.queue_created ? (
            <Badge variant="success" pill outline>
              {translate('Queue created')}
            </Badge>
          ) : (
            <Badge variant="warning" pill outline>
              {translate('Queue pending')}
            </Badge>
          ),
      },
      {
        title: translate('RMQ username'),
        render: ({ row }: { row: EventConsumer }) =>
          row.rmq_username ? (
            <code className="fs-8">{row.rmq_username}</code>
          ) : (
            renderFieldOrDash(row.rmq_username)
          ),
        copyField: (row: EventConsumer) => row.rmq_username || '',
      },
      {
        title: translate('Messages'),
        render: ({ row }: { row: EventConsumer }) => {
          const stats = queueStats.get(getConsumerQueueName(row.uuid));
          return stats
            ? renderFieldOrDash(
                <span className="fw-bold">
                  {stats.messages.toLocaleString()}
                </span>,
              )
            : renderFieldOrDash(null);
        },
      },
      {
        title: translate('Consumers connected'),
        render: ({ row }: { row: EventConsumer }) => {
          const stats = queueStats.get(getConsumerQueueName(row.uuid));
          if (!stats) return renderFieldOrDash(null);
          return (
            <span
              className={stats.consumers > 0 ? 'text-success' : 'text-danger'}
            >
              {stats.consumers}
            </span>
          );
        },
      },
      {
        title: translate('Created'),
        render: ({ row }: { row: EventConsumer }) =>
          formatDateTime(row.created),
      },
    ],
    [queueStats],
  );

  return (
    <>
      {statsUnavailable && (
        <p className="text-warning fs-7 mb-3">
          {translate(
            'RabbitMQ statistics are unavailable; message and consumer counts are not shown.',
          )}
        </p>
      )}
      <Table<EventConsumer>
        {...tableProps}
        columns={columns}
        verboseName={translate('event consumers')}
        hasActionBar={false}
        hoverShadow={false}
        initialPageSize={10}
        minHeight="auto"
        rowActions={({ row }) => (
          <EventConsumerRowActions row={row} refetch={tableProps.fetch} />
        )}
      />
    </>
  );
};

export const EventConsumersCard: FC = () => {
  // Collapsed by default: neither the consumer list nor the RabbitMQ
  // management scrape should run until an operator actually opens the card.
  const [open, setOpen] = useState(false);
  return (
    <AccordionCard
      id="event-consumers"
      title={translate('Event consumers')}
      subtitle={translate(
        'Unified pub/sub consumers registered through /api/event-consumers/. Site-agent consumers are managed on the Site agents page.',
      )}
      actions={
        <Link state="admin-site-agents" className="btn btn-sm btn-light">
          {translate('Site agents')}
        </Link>
      }
      isOpen={open}
      onToggle={setOpen}
      className="mb-6"
    >
      {open && <EventConsumersTable />}
    </AccordionCard>
  );
};

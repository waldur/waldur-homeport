import { FC, useMemo } from 'react';
import type { AgentQueueInfo } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { QueueKindBadge } from '../rabbitmq/QueueKindBadge';
import { RabbitMQQueueHealthBadge } from '../rabbitmq/RabbitMQQueueHealthBadge';

interface AgentQueuesTableProps {
  agentUuid: string;
  queues: AgentQueueInfo[];
}

export const AgentQueuesTable: FC<AgentQueuesTableProps> = ({
  agentUuid,
  queues,
}) => {
  const tableProps = useTable({
    table: `AgentQueues-${agentUuid}`,
    fetchData: createClientPaginatedFetcher(queues),
  });

  const columns = useMemo(
    () => [
      {
        title: translate('Queue'),
        render: ({ row }: { row: AgentQueueInfo }) => (
          <code className="fs-8 text-break" title={row.name}>
            {row.name}
          </code>
        ),
        copyField: (row: AgentQueueInfo) => row.name,
      },
      {
        title: translate('Kind'),
        render: ({ row }: { row: AgentQueueInfo }) => (
          <QueueKindBadge kind={row.kind} id={row.name} />
        ),
      },
      {
        title: translate('Object type'),
        render: ({ row }: { row: AgentQueueInfo }) =>
          renderFieldOrDash(row.object_type),
      },
      {
        title: translate('Messages'),
        render: ({ row }: { row: AgentQueueInfo }) => (
          <span className="fw-bold">{row.messages.toLocaleString()}</span>
        ),
      },
      {
        title: translate('Consumers connected'),
        render: ({ row }: { row: AgentQueueInfo }) =>
          row.consumers > 0 ? (
            <span className="text-success">{row.consumers}</span>
          ) : (
            <span className="text-danger">{translate('Not connected')}</span>
          ),
      },
      {
        title: translate('Backlog'),
        render: ({ row }: { row: AgentQueueInfo }) => (
          <RabbitMQQueueHealthBadge queue={row} />
        ),
      },
    ],
    [],
  );

  return (
    <Table<AgentQueueInfo>
      {...tableProps}
      columns={columns}
      verboseName={translate('queues')}
      hasActionBar={false}
      hoverShadow={false}
      initialPageSize={10}
      minHeight="auto"
    />
  );
};

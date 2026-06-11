import { FC, useMemo } from 'react';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import type { RmqStatsResponse, RmqVhostStats } from './api';
import { UserLink } from './RabbitMQEntityLinks';
import { RabbitMQVhostHealthBadge } from './RabbitMQQueueHealthBadge';
import { RabbitMQVhostActions } from './RabbitMQVhostActions';
import { RabbitMQVhostExpandableRow } from './RabbitMQVhostExpandableRow';

interface RabbitMQVhostListProps {
  data: RmqStatsResponse;
}

export const RabbitMQVhostList: FC<RabbitMQVhostListProps> = ({ data }) => {
  const user = useUser();
  const isStaff = user?.is_staff;

  const tableProps = useTable({
    table: 'RabbitMQVhosts',
    fetchData: createClientPaginatedFetcher(data.vhosts),
  });

  const columns = useMemo(
    () => [
      {
        title: translate('User'),
        render: ({ row }: { row: RmqVhostStats }) => (
          <UserLink user={row.user} />
        ),
      },
      {
        title: translate('Vhost'),
        render: ({ row }: { row: RmqVhostStats }) => (
          <Tip label={row.name} id={`vhost-${row.name}`}>
            <code className="fs-8">
              {row.name.length > 20
                ? `${row.name.substring(0, 20)}...`
                : row.name}
            </code>
          </Tip>
        ),
        copyField: (row: RmqVhostStats) => row.name,
      },
      {
        title: translate('Queues'),
        render: ({ row }: { row: RmqVhostStats }) => row.queues.length,
      },
      {
        title: translate('Total messages'),
        render: ({ row }: { row: RmqVhostStats }) => (
          <span className="fw-bold">{row.total_messages.toLocaleString()}</span>
        ),
      },
      {
        title: translate('Status'),
        render: ({ row }: { row: RmqVhostStats }) => (
          <RabbitMQVhostHealthBadge queues={row.queues} />
        ),
      },
    ],
    [],
  );

  if (data.vhosts.length === 0) {
    return (
      <div className="text-center text-muted py-10">
        {translate('No subscription queues found')}
      </div>
    );
  }

  return (
    <Table<RmqVhostStats>
      {...tableProps}
      columns={columns}
      verboseName={translate('vhosts')}
      hideRefresh
      expandableRow={RabbitMQVhostExpandableRow}
      rowActions={
        isStaff ? ({ row }) => <RabbitMQVhostActions vhost={row} /> : undefined
      }
    />
  );
};

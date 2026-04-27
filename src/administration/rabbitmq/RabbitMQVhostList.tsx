import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

import type { RmqStatsResponse, RmqVhostStats } from './api';
import { UserLink } from './RabbitMQEntityLinks';
import { RabbitMQVhostHealthBadge } from './RabbitMQQueueHealthBadge';
import { RabbitMQVhostActions } from './RabbitMQVhostActions';
import { RabbitMQVhostExpandableRow } from './RabbitMQVhostExpandableRow';

interface RabbitMQVhostListProps {
  data: RmqStatsResponse;
}

export const RabbitMQVhostList: FC<RabbitMQVhostListProps> = ({ data }) => {
  const isStaff = useSelector(isStaffSelector);

  const tableProps = useTable({
    table: 'RabbitMQVhosts',
    fetchData: () =>
      Promise.resolve({
        rows: data.vhosts,
        resultCount: data.vhosts.length,
      }),
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

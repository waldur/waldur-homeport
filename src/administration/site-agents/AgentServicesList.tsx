import { FC } from 'react';
import {
  AgentService,
  marketplaceSiteAgentServicesList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { AgentServiceRowActions } from './AgentServiceRowActions';

const mandatoryFields: Array<keyof AgentService> = [
  'uuid',
  'url',
  'identity',
  'identity_name',
  'name',
  'mode',
  'state',
  'created',
  'modified',
  'processors',
];

const getStateBadgeVariant = (state: string) => {
  switch (state) {
    case 'Active':
      return 'success';
    case 'Idle':
      return 'warning';
    case 'Error':
      return 'danger';
    default:
      return 'default';
  }
};

export const AgentServicesList: FC<TableWithPortal> = ({ portal }) => {
  const tableProps = useTable({
    table: 'AgentServicesList',
    fetchData: createFetcher(marketplaceSiteAgentServicesList),
    queryField: 'name',
    mandatoryFields,
  });

  const columns: Column<AgentService>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => <span className="fw-bold">{row.name}</span>,
      keys: ['name'],
      id: 'name',
    },
    {
      title: translate('Agent identity'),
      render: ({ row }) => <>{row.identity_name || DASH_ESCAPE_CODE}</>,
      keys: ['identity_name'],
      id: 'identity_name',
    },
    {
      title: translate('Mode'),
      render: ({ row }) => (
        <code className="text-muted">{row.mode || DASH_ESCAPE_CODE}</code>
      ),
      keys: ['mode'],
      id: 'mode',
    },
    {
      title: translate('State'),
      render: ({ row }) => (
        <Badge variant={getStateBadgeVariant(row.state)} pill outline>
          {row.state}
        </Badge>
      ),
      keys: ['state'],
      id: 'state',
    },
    {
      title: translate('Processors'),
      render: ({ row }) => <>{row.processors?.length || 0}</>,
      keys: ['processors'],
      id: 'processors_count',
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      keys: ['created'],
      id: 'created',
    },
  ];

  return (
    <Table<AgentService>
      {...tableProps}
      columns={columns}
      title={translate('Agent services')}
      verboseName={translate('Agent service')}
      hasQuery
      enableExport
      rowActions={({ row }) => (
        <AgentServiceRowActions row={row} refetch={tableProps.fetch} />
      )}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};

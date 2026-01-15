import { FC } from 'react';
import {
  AgentProcessor,
  marketplaceSiteAgentProcessorsList,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { AgentProcessorRowActions } from './AgentProcessorRowActions';

const mandatoryFields: Array<keyof AgentProcessor> = [
  'uuid',
  'url',
  'service',
  'service_name',
  'name',
  'backend_type',
  'backend_version',
  'last_run',
  'created',
];

export const AgentProcessorsList: FC<TableWithPortal> = ({ portal }) => {
  const tableProps = useTable({
    table: 'AgentProcessorsList',
    fetchData: createFetcher(marketplaceSiteAgentProcessorsList),
    queryField: 'name',
    mandatoryFields,
  });

  const columns: Column<AgentProcessor>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => <span className="fw-bold">{row.name}</span>,
      keys: ['name'],
      id: 'name',
    },
    {
      title: translate('Service'),
      render: ({ row }) => <>{row.service_name || DASH_ESCAPE_CODE}</>,
      keys: ['service_name'],
      id: 'service_name',
    },
    {
      title: translate('Backend type'),
      render: ({ row }) => (
        <code className="text-primary">{row.backend_type}</code>
      ),
      keys: ['backend_type'],
      id: 'backend_type',
    },
    {
      title: translate('Backend version'),
      render: ({ row }) => <>{row.backend_version || DASH_ESCAPE_CODE}</>,
      keys: ['backend_version'],
      id: 'backend_version',
    },
    {
      title: translate('Last run'),
      render: ({ row }) => (
        <>{row.last_run ? formatDateTime(row.last_run) : DASH_ESCAPE_CODE}</>
      ),
      keys: ['last_run'],
      id: 'last_run',
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      keys: ['created'],
      id: 'created',
    },
  ];

  return (
    <Table<AgentProcessor>
      {...tableProps}
      columns={columns}
      title={translate('Agent processors')}
      verboseName={translate('Agent processor')}
      hasQuery
      enableExport
      rowActions={({ row }) => (
        <AgentProcessorRowActions row={row} refetch={tableProps.fetch} />
      )}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};

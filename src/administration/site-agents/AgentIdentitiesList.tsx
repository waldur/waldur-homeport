import { FC } from 'react';
import {
  AgentIdentity,
  marketplaceSiteAgentIdentitiesList,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { AgentIdentityCreateButton } from './AgentIdentityCreateButton';
import { AgentIdentityExpandableRow } from './AgentIdentityExpandableRow';
import { AgentIdentityRowActions } from './AgentIdentityRowActions';

const mandatoryFields: Array<keyof AgentIdentity> = [
  'uuid',
  'url',
  'offering',
  'name',
  'version',
  'config_file_path',
  'last_restarted',
  'created',
  'services',
];

export const AgentIdentitiesList: FC<TableWithPortal> = ({ portal }) => {
  const tableProps = useTable({
    table: 'AgentIdentitiesList',
    fetchData: createFetcher(marketplaceSiteAgentIdentitiesList),
    queryField: 'name',
    mandatoryFields,
  });

  const columns: Column<AgentIdentity>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => <span className="fw-bold">{row.name}</span>,
      keys: ['name'],
      id: 'name',
    },
    {
      title: translate('Offering'),
      render: ({ row }) => (
        <code className="text-muted">
          {row.offering
            ? `${row.offering.substring(0, 8)}...`
            : DASH_ESCAPE_CODE}
        </code>
      ),
      copyField: (row) => row.offering,
      keys: ['offering'],
      id: 'offering',
    },
    {
      title: translate('Version'),
      render: ({ row }) => <>{row.version || DASH_ESCAPE_CODE}</>,
      keys: ['version'],
      id: 'version',
    },
    {
      title: translate('Config path'),
      render: ({ row }) => (
        <code className="text-muted">
          {row.config_file_path || DASH_ESCAPE_CODE}
        </code>
      ),
      keys: ['config_file_path'],
      id: 'config_file_path',
    },
    {
      title: translate('Last restarted'),
      render: ({ row }) => (
        <>
          {row.last_restarted
            ? formatDateTime(row.last_restarted)
            : DASH_ESCAPE_CODE}
        </>
      ),
      keys: ['last_restarted'],
      id: 'last_restarted',
    },
    {
      title: translate('Services'),
      render: ({ row }) => <>{row.services?.length || 0}</>,
      keys: ['services'],
      id: 'services_count',
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      keys: ['created'],
      id: 'created',
    },
  ];

  return (
    <Table<AgentIdentity>
      {...tableProps}
      columns={columns}
      title={translate('Agent identities')}
      verboseName={translate('Agent identity')}
      hasQuery
      enableExport
      expandableRow={AgentIdentityExpandableRow}
      rowActions={({ row }) => (
        <AgentIdentityRowActions row={row} refetch={tableProps.fetch} />
      )}
      tableActions={<AgentIdentityCreateButton refetch={tableProps.fetch} />}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};

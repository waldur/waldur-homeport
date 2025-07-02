import { FunctionComponent } from 'react';
import { RemoteSynchronisation } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { RemoteSyncCreateButton } from './RemoteSyncCreateButton';
import { RemoteSyncExpandableRow } from './RemoteSyncExpandableRow';
import { RemoteSyncRowActions } from './RemoteSyncRowActions';

const mandatoryFields: Array<keyof RemoteSynchronisation> = [
  'uuid',
  'api_url',
  'token',
  'remote_organization_uuid',
  'remote_organization_name',
  'local_service_provider',
  'local_service_provider_name',
  'is_active',
  'last_execution',
  'last_output',
  'get_state_display',
  'remotelocalcategory_set',
];

export const RemoteOfferingSyncList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'RemoteOfferingSync',
    fetchData: createFetcher('marketplace-remote-synchronisations'),
    queryField: 'title',
    mandatoryFields,
  });

  return (
    <Table<RemoteSynchronisation>
      {...tableProps}
      columns={[
        {
          title: translate('Remote server URL'),
          render: ({ row }) => <span className="text-dark">{row.api_url}</span>,
        },
        {
          title: translate('Remote organization'),
          render: ({ row }) => <>{row.remote_organization_name}</>,
        },
        {
          title: translate('Last execution'),
          render: ({ row }) => (
            <>
              {row.last_execution
                ? formatDateTime(row.last_execution)
                : DASH_ESCAPE_CODE}
            </>
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <Badge
              outline
              pill
              variant={
                ['OK', 'Active'].includes(row.get_state_display)
                  ? 'primary'
                  : 'default'
              }
            >
              {row.get_state_display}
            </Badge>
          ),
        },
        {
          title: translate('Enabled'),
          render: ({ row }) => (
            <Badge outline pill variant={row.is_active ? 'primary' : 'default'}>
              {row.is_active ? translate('Yes') : translate('No')}
            </Badge>
          ),
        },
      ]}
      title={translate('Remote offering sync')}
      verboseName={translate('Remote synchronization')}
      initialSorting={{ field: 'last_execution', mode: 'desc' }}
      enableExport
      hasQuery
      expandableRow={RemoteSyncExpandableRow}
      rowActions={({ row }) => (
        <RemoteSyncRowActions row={row} refetch={tableProps.fetch} />
      )}
      tableActions={<RemoteSyncCreateButton refetch={tableProps.fetch} />}
    />
  );
};

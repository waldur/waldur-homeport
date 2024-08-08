import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { SetRoutersButton } from './SetRoutersButton';

export const TenantRoutersList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      tenant_uuid: resourceScope.uuid,
      field: [
        'uuid',
        'url',
        'name',
        'description',
        'created',
        'resource_type',
        'routes',
        'service_name',
        'service_settings',
        'service_settings_uuid',
        'service_settings_state',
        'service_settings_error_message',
        'state',
        'error_message',
        'fixed_ips',
        'project_uuid',
      ],
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-routers',
    fetchData: createFetcher('openstack-routers'),
    queryField: 'name',
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Fixed IPs'),
          render: ({ row }) => row.fixed_ips.join(', ') || 'N/A',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('routers')}
      rowActions={({ row }) => <SetRoutersButton router={row} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      hasQuery={true}
    />
  );
};

import { FunctionComponent, useMemo } from 'react';
import { OpenStackRouter, OpenstackRoutersListData } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { CreateRouterAction } from './actions/CreateRouterAction';

export const TenantRoutersList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackRoutersListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      field: [
        'uuid',
        'url',
        'backend_id',
        'name',
        'description',
        'created',
        'ports',
        'resource_type',
        'routes',
        'service_name',
        'service_settings',
        'service_settings_uuid',
        'service_settings_state',
        'service_settings_error_message',
        'state',
        'tenant_uuid',
        'error_message',
        'fixed_ips',
        'offering_external_ips',
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
    <Table<OpenStackRouter>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
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
      title={translate('Routers')}
      tableActions={
        <CreateRouterAction resource={resourceScope} refetch={props.fetch} />
      }
      rowActions={({ row }) => (
        <ResourceRowActions resource={row} refetch={props.fetch} />
      )}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      hasQuery={true}
      showPageSizeSelector
    />
  );
};

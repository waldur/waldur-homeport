import { FunctionComponent, useMemo } from 'react';
import {
  OpenStackRouter,
  openstackRoutersList,
  OpenstackRoutersListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceRowActions } from '@/resource/actions/ResourceRowActions';
import { ResourceState } from '@/resource/state/ResourceState';
import { ResourceSummary } from '@/resource/summary/ResourceSummary';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

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
        'external_network_id',
        'external_network_name',
        'external_network_uuid',
        'has_external_gateway',
        'enable_snat',
        'external_fixed_ips',
      ],
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-routers',
    fetchData: createFetcher(openstackRoutersList),
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
          render: ({ row }) => renderFieldOrDash(row.fixed_ips.join(', ')),
        },
        {
          title: translate('External gateway'),
          render: ({ row }) =>
            renderFieldOrDash(
              row.has_external_gateway
                ? row.external_network_name || row.external_network_id
                : undefined,
            ),
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

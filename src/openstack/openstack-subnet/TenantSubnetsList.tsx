import { FunctionComponent, useMemo } from 'react';
import {
  OpenStackSubNet,
  openstackSubnetsList,
  OpenstackSubnetsListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionButtonResource } from '@/resource/actions/ActionButtonResource';
import { ResourceState } from '@/resource/state/ResourceState';
import { ResourceSummary } from '@/resource/summary/ResourceSummary';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { CreateSubnetButton } from './actions/CreateSubnetButton';

export const TenantSubnetsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackSubnetsListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      field: [
        'uuid',
        'url',
        'name',
        'description',
        'created',
        'cidr',
        'network',
        'network_name',
        'state',
        'error_message',
        'resource_type',
        'service_name',
        'service_settings',
        'service_settings_uuid',
        'service_settings_state',
        'service_settings_error_message',
        'allocation_pools',
        'enable_dhcp',
        'gateway_ip',
        'disable_gateway',
        'ip_version',
        'project_uuid',
        'backend_id',
        'router_name',
        'router_uuid',
        // Both the summary's "Enabled default gateway" and the Router column
        // below read this; without it the summary said No for every subnet.
        'is_connected',
      ],
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-subnets',
    fetchData: createFetcher(openstackSubnetsList),
    filter,
  });

  return (
    <Table<OpenStackSubNet>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
        {
          title: translate('Network'),
          render: ({ row }) => <>{row.network_name}</>,
        },
        {
          title: translate('CIDR'),
          render: ({ row }) => row.cidr,
        },
        {
          title: translate('Router'),
          // The router survives a disconnect on purpose -- it is what a
          // reconnect returns the subnet to -- so the column has to say which
          // of the two it is showing rather than assert a live attachment.
          render: ({ row }) =>
            !row.router_name ? (
              <>{DASH_ESCAPE_CODE}</>
            ) : row.is_connected ? (
              <>{row.router_name}</>
            ) : (
              <span className="text-muted">
                {translate('{router} (disconnected)', {
                  router: row.router_name,
                })}
              </span>
            ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      title={translate('Subnets')}
      verboseName={translate('subnets')}
      showPageSizeSelector
      tableActions={
        <CreateSubnetButton resource={resourceScope} refetch={props.fetch} />
      }
      rowActions={({ row }) => (
        <ActionButtonResource
          url={row.url}
          refetch={props.fetch}
          nestedResource
        />
      )}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
    />
  );
};

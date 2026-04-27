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
        <ActionButtonResource url={row.url} refetch={props.fetch} />
      )}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
    />
  );
};

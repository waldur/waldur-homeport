import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, connectTable, createFetcher } from '@waldur/table';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
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
      verboseName={translate('subnets')}
      hoverableRow={({ row }) => (
        <ActionButtonResource url={row.url} refetch={props.fetch} />
      )}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
    />
  );
};

const TableOptions = {
  table: 'openstack-subnets',
  fetchData: createFetcher('openstack-subnets'),
  mapPropsToFilter: (props) => ({
    tenant_uuid: props.resource.uuid,
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
    ],
  }),
};

export const TenantSubnetsList = connectTable(TableOptions)(TableComponent);

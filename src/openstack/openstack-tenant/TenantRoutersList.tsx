import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { SetRoutersButton } from './SetRoutersButton';

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
          title: translate('Fixed IPs'),
          render: ({ row }) => row.fixed_ips.join(', ') || 'N/A',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('routers')}
      hoverableRow={({ row }) => <SetRoutersButton router={row} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      hasQuery={true}
    />
  );
};

const TableOptions = {
  table: 'openstack-routers',
  fetchData: createFetcher('openstack-routers'),
  mapPropsToFilter: (props) => ({
    tenant_uuid: props.resource.uuid,
    field: [
      'uuid',
      'url',
      'name',
      'description',
      'created',
      'resource_type',
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
  queryField: 'name',
};

export const TenantRoutersList = connectTable(TableOptions)(TableComponent);

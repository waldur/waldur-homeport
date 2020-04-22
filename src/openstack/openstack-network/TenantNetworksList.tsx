import * as React from 'react';

import { NestedListActions } from '@waldur/resource/actions/NestedListActions';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { BooleanField } from '@waldur/table-react/BooleanField';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
        },
        {
          title: translate('Subnets'),
          render: ({ row }) =>
            row.subnets
              .map(subnet => `${subnet.name}: ${subnet.cidr}`)
              .join(', ') || 'N/A',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Is external'),
          render: ({ row }) => <BooleanField value={row.is_external} />,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <ResourceRowActions resource={row} />,
        },
      ]}
      verboseName={translate('networks')}
      actions={<NestedListActions resource={props.resource} tab="networks" />}
    />
  );
};

const TableOptions = {
  table: 'openstack-networks',
  fetchData: createFetcher('openstack-networks'),
  mapPropsToFilter: props => ({
    tenant_uuid: props.resource.uuid,
  }),
};

export const TenantNetworksList = connectTable(TableOptions)(TableComponent);

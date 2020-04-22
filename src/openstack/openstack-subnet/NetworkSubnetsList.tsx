import * as React from 'react';

import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

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
          title: translate('CIDR'),
          render: ({ row }) => row.cidr,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <ResourceRowActions resource={row} />,
        },
      ]}
      verboseName={translate('subnets')}
    />
  );
};

const TableOptions = {
  table: 'openstack-subnets',
  fetchData: createFetcher('openstack-subnets'),
  mapPropsToFilter: props => ({
    network_uuid: props.resource.uuid,
  }),
};

export const NetworkSubnetsList = connectTable(TableOptions)(TableComponent);

import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { NestedListActions } from '@waldur/resource/actions/NestedListActions';
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
          orderField: 'name',
        },
        {
          title: translate('Network'),
          render: ({ row }) => row.network_name || 'N/A',
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => row.mac_address || 'N/A',
        },
        {
          title: translate('Created'),
          render: ({ row }) => formatDateTime(row.created),
          orderField: 'created',
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
      verboseName={translate('ports')}
      actions={<NestedListActions resource={props.resource} tab="ports" />}
    />
  );
};

const mapPropsToFilter = props => ({
  vm_uuid: props.resource.uuid,
});

const TableOptions = {
  table: 'vmware-ports',
  fetchData: createFetcher('vmware-ports'),
  mapPropsToFilter,
};

export const PortsList = connectTable(TableOptions)(TableComponent);

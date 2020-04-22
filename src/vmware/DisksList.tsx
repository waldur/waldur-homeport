import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatFilesize } from '@waldur/core/utils';
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
          title: translate('Size'),
          render: ({ row }) => formatFilesize(row.size),
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
      verboseName={translate('disks')}
      hasQuery={false}
      actions={<NestedListActions resource={props.resource} tab="disks" />}
    />
  );
};

const mapPropsToFilter = props => ({
  vm_uuid: props.resource.uuid,
});

const TableOptions = {
  table: 'vmware-disks',
  fetchData: createFetcher('vmware-disks'),
  mapPropsToFilter,
};

export const DisksList = connectTable(TableOptions)(TableComponent);

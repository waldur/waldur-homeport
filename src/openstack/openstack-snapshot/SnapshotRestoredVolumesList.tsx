import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatFilesize } from '@waldur/core/utils';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { connectAngularComponent } from '@waldur/store/connect';
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
          title: translate('Description'),
          render: ({ row }) => row.description || 'N/A',
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
      ]}
      verboseName={translate('restored volumes')}
    />
  );
};

const mapPropsToFilter = props => ({
  snapshot: props.resource.url,
});

const TableOptions = {
  table: 'openstacktenant-volumes',
  fetchData: createFetcher('openstacktenant-volumes'),
  mapPropsToFilter,
};

const SnapshotRestoredVolumesList = connectTable(TableOptions)(TableComponent);

export default connectAngularComponent(SnapshotRestoredVolumesList, [
  'resource',
]);

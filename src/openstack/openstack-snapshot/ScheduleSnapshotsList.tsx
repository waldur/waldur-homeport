import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatFilesize } from '@waldur/core/utils';
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
        {
          title: translate('Actions'),
          render: ({ row }) => <ResourceRowActions resource={row} />,
        },
      ]}
      verboseName={translate('snapshots')}
      hasQuery={false}
    />
  );
};

const TableOptions = {
  table: 'openstacktenant-snapshots',
  fetchData: createFetcher('openstacktenant-snapshots'),
  mapPropsToFilter: props => ({
    snapshot_schedule: props.resource.uuid,
  }),
};

export const ScheduleSnapshotsList = connectTable(TableOptions)(TableComponent);

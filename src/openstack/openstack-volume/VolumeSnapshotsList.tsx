import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatFilesize } from '@waldur/core/utils';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { CreateSnapshotAction } from './actions/CreateSnapshotAction';

const TableComponent: FunctionComponent<any> = (props) => {
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
      actions={<CreateSnapshotAction resource={props.resource} />}
    />
  );
};

const mapPropsToFilter = (props) => ({
  source_volume_uuid: props.resource.uuid,
});

const TableOptions = {
  table: 'openstacktenant-snapshots',
  fetchData: createFetcher('openstacktenant-snapshots'),
  mapPropsToFilter,
};

export const VolumeSnapshotsList = connectTable(TableOptions)(TableComponent);

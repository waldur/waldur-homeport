import { FunctionComponent } from 'react';

import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { formatCrontab } from '@waldur/resource/crontab';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';

import { CreateSnapshotScheduleAction } from '../openstack-volume/actions/CreateSnapshotScheduleAction';

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
          title: translate('Max number of VM snapshots'),
          render: ({ row }) => row.maximal_number_of_resources || 'N/A',
        },
        {
          title: translate('Schedule'),
          render: ({ row }) => formatCrontab(row.schedule),
        },
        {
          title: translate('Is active'),
          render: ({ row }) => <BooleanField value={row.is_active} />,
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
      verboseName={translate('snapshot schedules')}
      hasQuery={false}
      actions={<CreateSnapshotScheduleAction resource={props.resource} />}
    />
  );
};

const mapPropsToFilter = (props) => ({
  source_volume: props.resource.url,
});

const TableOptions = {
  table: 'openstacktenant-snapshot-schedules',
  fetchData: createFetcher('openstacktenant-snapshot-schedules'),
  mapPropsToFilter,
};

export const SnapshotSchedulesList = connectTable(TableOptions)(TableComponent);

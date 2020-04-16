import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { NestedListActions } from '@waldur/resource/actions/NestedListActions';
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
          title: translate('Keep until'),
          render: ({ row }) => formatDateTime(row.created),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('backups')}
      hasQuery={false}
      actions={<NestedListActions resource={props.resource} tab="backups" />}
    />
  );
};

const mapPropsToFilter = props => {
  const fields = {
    'OpenStackTenant.Instance': 'instance',
    'OpenStackTenant.BackupSchedule': 'backup_schedule',
  };
  const { resource_type, url } = props.resource;
  const field = fields[resource_type];
  if (field) {
    return {
      [field]: url,
    };
  }
};

const TableOptions = {
  table: 'openstacktenant-backups',
  fetchData: createFetcher('openstacktenant-backups'),
  mapPropsToFilter,
};

const BackupSnapshotsList = connectTable(TableOptions)(TableComponent);

export default connectAngularComponent(BackupSnapshotsList, ['resource']);

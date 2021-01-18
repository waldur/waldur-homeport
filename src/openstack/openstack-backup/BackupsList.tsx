import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { CreateBackupAction } from '../openstack-instance/actions/CreateBackupAction';

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
          title: translate('Keep until'),
          render: ({ row }) =>
            row.kept_until
              ? formatDateTime(row.kept_until)
              : translate('Keep forever'),
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
      verboseName={translate('VM snapshots')}
      hasQuery={false}
      actions={<CreateBackupAction resource={props.resource} />}
    />
  );
};

const mapPropsToFilter = (props) => {
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

export const BackupsList = connectTable(TableOptions)(TableComponent);

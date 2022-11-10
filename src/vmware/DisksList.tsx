import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { CreateDiskAction } from './actions/CreateDiskAction';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
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
      ]}
      verboseName={translate('disks')}
      hasQuery={false}
      actions={<CreateDiskAction resource={props.resource} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      hoverableRow={({ row }) => <ActionButtonResource url={row.url} />}
    />
  );
};

const mapPropsToFilter = (props) => ({
  vm_uuid: props.resource.uuid,
});

const TableOptions = {
  table: 'vmware-disks',
  fetchData: createFetcher('vmware-disks'),
  mapPropsToFilter,
};

export const DisksList = connectTable(TableOptions)(TableComponent);

import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CreateDiskAction } from './actions/CreateDiskAction';

export const DisksList: FunctionComponent<{ resource }> = ({ resource }) => {
  const filter = useMemo(
    () => ({
      vm_uuid: resource.uuid,
    }),
    [resource],
  );
  const tableProps = useTable({
    table: 'vmware-disks',
    fetchData: createFetcher('vmware-disks'),
    filter,
  });

  return (
    <Table
      {...tableProps}
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
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('disks')}
      hasQuery={false}
      actions={<CreateDiskAction resource={resource} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      hoverableRow={({ row }) => (
        <ActionButtonResource url={row.url} refetch={tableProps.fetch} />
      )}
    />
  );
};

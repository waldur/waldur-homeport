import { FunctionComponent, useMemo } from 'react';
import { VmwareDisk, vmwareDisksList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { ActionButtonResource } from '@/resource/actions/ActionButtonResource';
import { ResourceState } from '@/resource/state/ResourceState';
import { ResourceSummary } from '@/resource/summary/ResourceSummary';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { CreateDiskAction } from './actions/CreateDiskAction';

export const DisksList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      vm_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const tableProps = useTable({
    table: 'vmware-disks',
    fetchData: createFetcher(vmwareDisksList),
    filter,
  });

  return (
    <Table<VmwareDisk>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
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
      showPageSizeSelector
      tableActions={<CreateDiskAction resource={resourceScope} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      rowActions={({ row }) => (
        <ActionButtonResource url={row.url} refetch={tableProps.fetch} />
      )}
    />
  );
};

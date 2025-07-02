import { FunctionComponent, useMemo } from 'react';
import { VmwareDisk } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

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
    fetchData: createFetcher('vmware-disks'),
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

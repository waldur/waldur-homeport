import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { SubmitJobAction } from './SubmitJobAction';

export const AllocationJobsTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => <ResourceName resource={row} />,
    },
    {
      title: translate('User'),
      render: ({ row }) => row.user_name || 'N/A',
    },
    {
      title: translate('Backend ID'),
      render: ({ row }) => row.backend_id || 'N/A',
    },
    {
      title: translate('State'),
      render: ({ row }) => <ResourceState resource={row} />,
    },
  ];
  const filter = useMemo(
    () => ({
      allocation_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const tableProps = useTable({
    table: 'AllocationJobsTable',
    fetchData: createFetcher('slurm-jobs'),
    filter,
  });

  return (
    <Table
      {...tableProps}
      title={translate('Jobs')}
      columns={columns}
      verboseName={translate('jobs')}
      tableActions={<SubmitJobAction resource={resourceScope} />}
    />
  );
};

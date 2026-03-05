import { FunctionComponent, useMemo } from 'react';
import { slurmJobsList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { SubmitJobAction } from './SubmitJobAction';

export const AllocationJobsTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => <ResourceName resource={row} />,
      copyField: (row) => row.name,
    },
    {
      title: translate('User'),
      render: ({ row }) => renderFieldOrDash(row.user_name),
    },
    {
      title: translate('Backend ID'),
      render: ({ row }) => renderFieldOrDash(row.backend_id),
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
    fetchData: createFetcher(slurmJobsList),
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

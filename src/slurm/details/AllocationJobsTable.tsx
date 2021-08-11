import { FunctionComponent, ComponentType } from 'react';

import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/resource/types';
import { Table, connectTable, createFetcher } from '@waldur/table';

interface AllocationJobsTableProps {
  resource: Resource;
}

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Backend ID'),
      render: ({ row }) => row.backend_id || 'N/A',
    },
    {
      title: translate('Runtime state'),
      render: ({ row }) => row.runtime_state || 'N/A',
    },
  ];
  return <Table {...props} columns={columns} verboseName={translate('jobs')} />;
};

const mapPropsToFilter = ({ resource }: AllocationJobsTableProps) => ({
  allocation_uuid: resource.uuid,
});

const TableOptions = {
  table: 'AllocationJobsTable',
  fetchData: createFetcher('slurm-jobs'),
  mapPropsToFilter,
};

export const AllocationJobsTable = connectTable(TableOptions)(
  TableComponent,
) as ComponentType<AllocationJobsTableProps>;

import { FunctionComponent, ComponentType } from 'react';

import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/resource/types';
import { Table, connectTable, createFetcher } from '@waldur/table';

interface AllocationUsersTableProps {
  resource: Resource;
}

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Username'),
      render: ({ row }) => row.username,
    },
  ];
  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('allocation users')}
    />
  );
};

const mapPropsToFilter = ({ resource }: AllocationUsersTableProps) => ({
  allocation_uuid: resource.uuid,
});

const TableOptions = {
  table: 'AllocationUsersTable',
  fetchData: createFetcher('slurm-associations'),
  mapPropsToFilter,
};

export const AllocationUsersTable = connectTable(TableOptions)(
  TableComponent,
) as ComponentType<AllocationUsersTableProps>;

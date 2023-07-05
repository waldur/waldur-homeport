import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const AllocationUsersTable: FunctionComponent<{ scope }> = ({
  scope,
}) => {
  const filter = useMemo(
    () => ({
      allocation_uuid: scope.uuid,
    }),
    [scope],
  );
  const tableProps = useTable({
    table: 'AllocationUsersTable',
    fetchData: createFetcher('slurm-associations'),
    filter,
  });
  return (
    <Table
      {...tableProps}
      title={translate('Allocation users')}
      columns={[
        {
          title: translate('Username'),
          render: ({ row }) => row.username,
        },
      ]}
      verboseName={translate('allocation users')}
    />
  );
};

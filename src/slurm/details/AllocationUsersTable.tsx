import { FunctionComponent, useMemo } from 'react';
import { slurmAssociationsList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

export const AllocationUsersTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      allocation_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const tableProps = useTable({
    table: 'AllocationUsersTable',
    fetchData: createFetcher(slurmAssociationsList),
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

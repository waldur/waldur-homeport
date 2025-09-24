import { FunctionComponent, useMemo } from 'react';
import { slurmAssociationsList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

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

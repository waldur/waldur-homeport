import { useMemo } from 'react';
import { marketplaceResourceUsersList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { AddUserButton } from './AddUserButton';
import { DeleteUserAction } from './DeleteUserButton';

export const ResourceUsersList = ({ resource, offering }) => {
  const filter = useMemo(() => ({ resource_uuid: resource.uuid }), [resource]);
  const tableProps = useTable({
    table: `ResourceUsersList`,
    filter,
    fetchData: createFetcher(marketplaceResourceUsersList),
  });

  return (
    <Table
      {...tableProps}
      title={translate('Roles')}
      columns={[
        {
          title: translate('User'),
          render: ({ row }) => <>{row.user_full_name || row.user_username}</>,
        },
        {
          title: translate('Role'),
          render: ({ row }) => <>{row.role_name}</>,
        },
      ]}
      verboseName={translate('roles')}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <DeleteUserAction row={row} refetch={tableProps.fetch} />
        </ActionsDropdown>
      )}
      tableActions={
        <AddUserButton
          resource={resource}
          offering={offering}
          refetch={tableProps.fetch}
        />
      }
    />
  );
};

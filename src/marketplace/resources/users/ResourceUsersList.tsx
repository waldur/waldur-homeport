import { useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { AddUserButton } from './AddUserButton';
import { DeleteUserButton } from './DeleteUserButton';

export const ResourceUsersList = ({ resource, offering }) => {
  const filter = useMemo(() => ({ resource_uuid: resource.uuid }), [resource]);
  const tableProps = useTable({
    table: `ResourceUsersList`,
    filter,
    fetchData: createFetcher('marketplace-resource-users'),
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
        <DeleteUserButton user={row} refetch={tableProps.fetch} />
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

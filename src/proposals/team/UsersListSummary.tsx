import { FC } from 'react';

import { createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { UsersList } from './UsersList';

export const UsersListSummary: FC<{ scope; title }> = (props) => {
  const usersTable = useTable({
    table: `UserList${props.title}`,
    fetchData: createFetcher(`${props.scope.url}list_users/`),
  });
  return (
    <UsersList
      table={usersTable}
      scope={props.scope}
      hideRole={false}
      readOnly
    />
  );
};

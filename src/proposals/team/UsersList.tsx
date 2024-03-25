import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { GenericInvitationContext } from '@waldur/invitations/types';
import { GenericPermission } from '@waldur/permissions/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { RoleField } from '@waldur/user/affiliations/RoleField';

import { AddUserButton } from './AddUserButton';
import { UserRemoveButton } from './UserRemoveButton';
import { UsersListPlaceholder } from './UsersListPlaceholder';

export const UsersList: FC<GenericInvitationContext> = (props) => {
  const tableProps = useTable({
    table: 'UsersListList',
    fetchData: createFetcher(`${props.scope.url}list_users/`),
  });

  return (
    <Table<GenericPermission>
      {...tableProps}
      className="mb-7"
      placeholderComponent={
        <UsersListPlaceholder refetch={tableProps.fetch} {...props} />
      }
      columns={[
        {
          title: translate('Reviewer'),
          render: ({ row }) => <>{row.user_full_name || row.user_username}</>,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.user_email}</>,
        },
        {
          title: translate('Role'),
          render: RoleField,
        },
      ]}
      title={translate('Users')}
      verboseName={translate('users')}
      actions={<AddUserButton refetch={tableProps.fetch} {...props} />}
      hoverableRow={({ row }) => (
        <UserRemoveButton
          permission={row}
          refetch={tableProps.fetch}
          scope={props.scope}
        />
      )}
    />
  );
};

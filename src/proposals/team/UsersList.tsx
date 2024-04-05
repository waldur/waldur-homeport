import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { Table } from '@waldur/table';
import { RoleField } from '@waldur/user/affiliations/RoleField';

import { UserRemoveButton } from './UserRemoveButton';

export const UsersList: FC<any> = ({ table, scope, hideRole, readOnly }) => {
  const columns = [
    {
      title: translate('User'),
      render: ({ row }) => <>{row.user_full_name || row.user_username}</>,
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.user_email}</>,
    },
  ];
  if (!hideRole) {
    columns.push({
      title: translate('Role'),
      render: RoleField,
    });
  }
  return (
    <Table<GenericPermission>
      {...table}
      className="mb-7"
      columns={columns}
      title={translate('Users')}
      verboseName={translate('users')}
      hoverableRow={
        readOnly
          ? null
          : ({ row }) => (
              <UserRemoveButton
                permission={row}
                refetch={table.fetch}
                scope={scope}
              />
            )
      }
    />
  );
};

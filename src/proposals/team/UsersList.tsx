import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { Table } from '@waldur/table';
import { RoleField } from '@waldur/user/affiliations/RoleField';

import { UserRemoveButton } from './UserRemoveButton';

export const UsersList: FC<any> = ({ table, scope }) => {
  return (
    <Table<GenericPermission>
      {...table}
      className="mb-7"
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
      hoverableRow={({ row }) => (
        <UserRemoveButton
          permission={row}
          refetch={table.fetch}
          scope={scope}
        />
      )}
    />
  );
};

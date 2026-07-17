import { RoleDetails, rolesList } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { formatRoleType } from '@/permissions/utils';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { RoleActions } from './RoleActions';
import { RoleCreateButton } from './RoleCreateButton';

export const RolesList = () => {
  const tableProps = useTable({
    table: `RolesList`,
    fetchData: createFetcher(rolesList, {
      // Only request the fields the table renders. This drops the heavy
      // per-role `permissions` list and the 14 `description_<lang>`
      // translations (mostly empty) from the list response. Both are
      // fetched lazily via rolesRetrieve when an edit dialog is opened.
      query: {
        field: [
          'uuid',
          'name',
          'content_type',
          'description',
          'users_count',
          'is_active',
          'is_system_role',
        ],
      },
    }),
  });

  return (
    <Table<RoleDetails>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <>
              {row.name}{' '}
              {row.is_system_role && (
                <Badge pill outline className="ms-2">
                  {translate('System role')}
                </Badge>
              )}
            </>
          ),

          copyField: (row) => row.name,
        },
        {
          title: translate('Scope'),
          render: ({ row }) => formatRoleType(row.content_type),
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.description,
        },
        {
          title: translate('Assigned users count'),
          render: ({ row }) => row.users_count,
        },
        {
          title: translate('Active'),
          render: ({ row }) => <BooleanField value={row.is_active} />,
        },
      ]}
      verboseName={translate('roles')}
      rowActions={({ row }) => (
        <RoleActions row={row} refetch={tableProps.fetch} />
      )}
      showPageSizeSelector={true}
      tableActions={<RoleCreateButton refetch={tableProps.fetch} />}
    />
  );
};

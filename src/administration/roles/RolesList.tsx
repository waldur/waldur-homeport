import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { formatRoleType } from '@waldur/permissions/utils';
import { createFetcher, Table } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { useTable } from '@waldur/table/utils';

import { RoleActions } from './RoleActions';
import { RoleCreateButton } from './RoleCreateButton';

export const RolesList = () => {
  const tableProps = useTable({
    table: `RolesList`,
    fetchData: createFetcher('roles'),
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <>
              {row.name}{' '}
              {row.is_system_role && (
                <Badge outline pill className="ms-2">
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

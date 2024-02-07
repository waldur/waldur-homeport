import { Badge } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { formatRoleType } from '@waldur/permissions/utils';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { RoleCreateButton } from './RoleCreateButton';
import { RoleDeleteButton } from './RoleDeleteButton';
import { RoleEditButton } from './RoleEditButton';

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
                <Badge bg="primary" className="ms-2">
                  {translate('System role')}
                </Badge>
              )}
            </>
          ),
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
      ]}
      verboseName={translate('roles')}
      hoverableRow={({ row }) => (
        <>
          <RoleEditButton row={row} refetch={tableProps.fetch} />
          {!row.is_system_role && (
            <RoleDeleteButton row={row} refetch={tableProps.fetch} />
          )}
        </>
      )}
      showPageSizeSelector={true}
      actions={<RoleCreateButton refetch={tableProps.fetch} />}
    />
  );
};

import { FC, useMemo } from 'react';
import { RoleDetails, rolesList } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { StateIndicator } from '@/core/StateIndicator';
import { RoleUsersExpandableRow } from '@/customer/roles/RoleUsersExpandableRow';
import { translate } from '@/i18n';
import { formatRoleType } from '@/permissions/utils';
import { createFetcher } from '@/table/api';
import {
  AdminRolesFilter,
  AdminRolesFilterFormId,
  selectAdminRolesFilter,
} from '@/table/generated/AdminRolesFilter';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { RoleActions } from './RoleActions';
import { RoleCreateButton } from './RoleCreateButton';
import { RolePermissionDelta } from './RolePermissionDelta';

export const RolesList: FC<TableWithPortal> = ({ portal }) => {
  const filterValues = useFilterValues('RolesList');
  const filter = useMemo(
    () => selectAdminRolesFilter(filterValues),
    [filterValues],
  );
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
          'customer_uuid',
          'customer_name',
          'template_uuid',
          'template_name',
        ],
      },
    }),
    filter,
    queryField: 'query',
    syncFiltersToURL: true,
  });

  return (
    <Table<RoleDetails>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
        {
          // `name` is the technical code (globally unique, scope-prefixed, sent
          // as `role_name` in permission payloads), so it is rendered as one and
          // stays the copyable field.
          title: translate('Code'),
          orderField: 'name',
          render: ({ row }) => (
            <span className="font-monospace">{row.name}</span>
          ),
          copyField: (row) => row.name,
        },
        {
          title: translate('Scope'),
          orderField: 'scope',
          render: ({ row }) => formatRoleType(row.content_type),
        },
        {
          // Whether the role is a built-in system role (fixed, deployment-wide)
          // or a staff-created custom one. Plain text like Scope: both this and
          // Availability hold a closed pair of values, so badging them only
          // produced two same-coloured pills per row. Status keeps the one
          // badge in this table.
          title: translate('Type'),
          orderField: 'is_system_role',
          render: ({ row }) => (
            <>
              {row.is_system_role ? translate('System') : translate('Custom')}
              {/* What a clone changed relative to its template; the full
                  comparison is a row action. */}{' '}
              <RolePermissionDelta row={row} />
            </>
          ),
        },
        {
          // Where the role can be used: everywhere, or only within one
          // organization (an org-scoped clone), independent of system/custom.
          // The organization is a link, which already sets it apart from the
          // deployment-wide default without a badge around it.
          title: translate('Availability'),
          render: ({ row }) =>
            row.customer_name && row.customer_uuid ? (
              <Link
                state="organization-manage"
                params={{ uuid: row.customer_uuid, tab: 'roles' }}
                label={row.customer_name}
              />
            ) : (
              translate('Deployment-wide')
            ),
        },
        {
          title: translate('Assigned users count'),
          orderField: 'users_count',
          render: ({ row }) => row.users_count,
        },
        {
          // Active/Inactive pill, as every other administration table renders a
          // status (AnnouncementsList, RequestTypesList); the bare check/cross
          // icon `BooleanField` draws reads as a different kind of value.
          title: translate('Status'),
          orderField: 'is_active',
          render: ({ row }) => (
            <StateIndicator
              variant={row.is_active ? 'success' : 'danger'}
              label={
                row.is_active ? translate('Active') : translate('Inactive')
              }
              tone="outline"
              shape="pill"
            />
          ),
        },
      ]}
      title={translate('Roles')}
      verboseName={translate('roles')}
      // Rendered only as a tab of the roles page, whose card and toolbar these
      // controls belong to.
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
      expandableRow={RoleUsersExpandableRow}
      filters={<AdminRolesFilter />}
      formId={AdminRolesFilterFormId}
      hasQuery={true}
      rowActions={({ row }) => (
        <RoleActions row={row} refetch={tableProps.fetch} />
      )}
      showPageSizeSelector={true}
      tableActions={<RoleCreateButton refetch={tableProps.fetch} />}
    />
  );
};

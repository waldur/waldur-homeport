import { useMemo } from 'react';
import { RoleDetails, rolesList } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { Link } from '@/core/Link';
import { RoleUsersExpandableRow } from '@/customer/roles/RoleUsersExpandableRow';
import { translate } from '@/i18n';
import { formatRoleType } from '@/permissions/utils';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import {
  AdminRolesFilter,
  AdminRolesFilterFormId,
  selectAdminRolesFilter,
} from '@/table/generated/AdminRolesFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { RoleActions } from './RoleActions';
import { RoleCreateButton } from './RoleCreateButton';
import { RolePermissionDelta } from './RolePermissionDelta';

export const RolesList = () => {
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
          // or a staff-created custom one.
          title: translate('Type'),
          orderField: 'is_system_role',
          render: ({ row }) => (
            <>
              {row.is_system_role ? (
                <Badge variant="secondary" pill outline>
                  {translate('System')}
                </Badge>
              ) : (
                <Badge variant="primary" pill outline>
                  {translate('Custom')}
                </Badge>
              )}
              {/* What a clone changed relative to its template; the full
                  comparison is a row action. */}{' '}
              <RolePermissionDelta row={row} />
            </>
          ),
        },
        {
          // Where the role can be used: everywhere, or only within one
          // organization (an org-scoped clone), independent of system/custom.
          title: translate('Availability'),
          render: ({ row }) =>
            row.customer_name && row.customer_uuid ? (
              <Link
                state="organization-manage"
                params={{ uuid: row.customer_uuid, tab: 'roles' }}
              >
                <Badge variant="success" pill outline>
                  {row.customer_name}
                </Badge>
              </Link>
            ) : (
              <Badge variant="secondary" pill outline>
                {translate('Deployment-wide')}
              </Badge>
            ),
        },
        {
          title: translate('Assigned users count'),
          orderField: 'users_count',
          render: ({ row }) => row.users_count,
        },
        {
          title: translate('Active'),
          orderField: 'is_active',
          render: ({ row }) => <BooleanField value={row.is_active} />,
        },
      ]}
      verboseName={translate('roles')}
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

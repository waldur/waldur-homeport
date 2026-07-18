import { FC, useMemo } from 'react';
import { Permission, RoleDetails, userPermissionsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

// Dashboard route + UUID param name per scope type, so a grant's scope links to
// the corresponding page.
const SCOPE_STATES = {
  customer: 'organization.dashboard',
  project: 'project.dashboard',
  offering: 'marketplace-offering-details',
  call: 'protected-call.main',
};
const SCOPE_UUID_PARAM = {
  customer: 'uuid',
  project: 'uuid',
  offering: 'offering_uuid',
  call: 'call_uuid',
};

const renderScope = (row: Permission) => {
  if (!row.scope_name) {
    return renderFieldOrDash(row.scope_name);
  }
  const state = SCOPE_STATES[row.scope_type];
  if (!state || !row.scope_uuid) {
    return row.scope_name;
  }
  return (
    <Link
      state={state}
      params={{ [SCOPE_UUID_PARAM[row.scope_type]]: row.scope_uuid }}
    >
      {row.scope_name}
    </Link>
  );
};

// Nested table of users currently holding a role, shown when a role row is
// expanded. Gated to staff/support by the backend (userPermissionsList only
// returns other users' grants to them). When customerUuid is set, only grants
// within that organization (its own scope plus its projects) are listed.
const RoleUsersTable: FC<{ roleUuid: string; customerUuid?: string }> = ({
  roleUuid,
  customerUuid,
}) => {
  const filter = useMemo(
    () => ({
      role_uuid: roleUuid,
      is_active: true,
      ...(customerUuid ? { customer_uuid: customerUuid } : {}),
    }),
    [roleUuid, customerUuid],
  );

  const tableProps = useTable({
    table: `role-users-${roleUuid}`,
    fetchData: createFetcher(userPermissionsList),
    filter,
  });

  const columns: Column<Permission>[] = [
    {
      title: translate('User'),
      render: ({ row }) =>
        row.user_uuid ? (
          <Link
            state="support-user-manage"
            params={{ user_uuid: row.user_uuid }}
            label={renderFieldOrDash(row.user_name)}
          />
        ) : (
          renderFieldOrDash(row.user_name)
        ),
      id: 'user_name',
    },
    {
      title: translate('Username'),
      render: ({ row }) => renderFieldOrDash(row.user_username),
      id: 'user_username',
    },
    {
      title: translate('Email'),
      render: ({ row }) => renderFieldOrDash(row.user_email),
      id: 'user_email',
    },
    {
      title: translate('Scope'),
      render: ({ row }) => renderScope(row),
      id: 'scope_name',
    },
    // The owning organization is redundant when the list is already scoped to
    // one organization.
    ...(customerUuid
      ? []
      : [
          {
            title: translate('Organization'),
            render: ({ row }) => renderFieldOrDash(row.customer_name),
            id: 'customer_name',
          } as Column<Permission>,
        ]),
    {
      title: translate('Granted'),
      render: ({ row }) => renderFieldOrDash(formatDateTime(row.created)),
      id: 'created',
    },
    {
      title: translate('Expires'),
      render: ({ row }) =>
        row.expiration_time
          ? formatDateTime(row.expiration_time)
          : translate('Never'),
      id: 'expiration_time',
    },
  ];

  return (
    <Table<Permission>
      {...tableProps}
      columns={columns}
      verboseName={translate('users')}
      emptyMessage={translate('No users are assigned this role.')}
      placeholderHasRetry={false}
      hideTitle
      hasActionBar={false}
    />
  );
};

export const RoleUsersExpandableRow: FC<{
  row: RoleDetails;
  customerUuid?: string;
}> = ({ row, customerUuid }) => (
  <ExpandableContainer>
    <RoleUsersTable roleUuid={row.uuid} customerUuid={customerUuid} />
  </ExpandableContainer>
);

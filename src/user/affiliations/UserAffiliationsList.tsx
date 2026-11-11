import { FunctionComponent, useMemo } from 'react';
import { userPermissionsList, UserPermissionsListData } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { formatRoleType, formatScopeName } from '@/permissions/utils';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { AddUserRoleButton } from './AddUserRoleButton';
import { RolePopover } from './RolePopover';
import { getScopeLink } from './scopeLink';
import { UserAffiliationExpandableRow } from './UserAffiliationExpandableRow';
import { UserAffiliationsBulkRemoveButton } from './UserAffiliationsBulkRemoveButton';
import { UserAffiliationsDropdownActions } from './UserAffiliationsDropdownActions';
import { UserAffiliationsFilter } from './UserAffiliationsFilter';
import { UserAffiliationsRowActions } from './UserAffiliationsRowActions';

interface UserAffiliationsListProps {
  user;
  hasActionBar?: boolean;
  fullWidth?: boolean;
  cardBordered?: boolean;
  /**
   * Staff grant from this list. Off on the personal dashboard: a grant there
   * would be the signed-in user adding their own role, and the page was not
   * the place this action was introduced for.
   */
  allowRoleGrant?: boolean;
}

interface UserAffiliationsFilterValues {
  scope_type: string;
  scope_name: string;
  role: {
    uuid: string;
  };
  show_inactive?: boolean | '';
}

export const UserAffiliationsList: FunctionComponent<
  UserAffiliationsListProps
> = ({
  user,
  hasActionBar = true,
  fullWidth,
  cardBordered = true,
  allowRoleGrant = true,
}) => {
  const values = useFilterValues('UserAffiliationsList');
  const formValues = (values as UserAffiliationsFilterValues) || {
    scope_type: undefined,
    scope_name: undefined,
    role: undefined,
  };
  // The backend only exposes revoked/historical grants to staff and support;
  // for everyone else the role status column and filter are meaningless, so
  // they are hidden.
  const currentUser = useUser();
  const isStaffOrSupport = Boolean(
    currentUser?.is_staff || currentUser?.is_support,
  );
  const filter = useMemo(() => {
    const result: UserPermissionsListData['query'] = {
      user: user.uuid,
    };

    // Only active grants are shown by default; staff/support can opt in to the
    // full history (active + revoked) via the "Role status" filter.
    if (isStaffOrSupport && formValues?.show_inactive) {
      result.show_inactive = true;
    }
    if (formValues?.scope_type) {
      result.scope_type =
        typeof formValues.scope_type === 'object'
          ? (formValues.scope_type as any).value
          : formValues.scope_type;
    }
    if (formValues?.scope_name) {
      result.scope_name = formValues.scope_name;
    }
    if (formValues?.role) {
      result.role_uuid = formValues.role.uuid;
    }

    return result;
  }, [
    user.uuid,
    isStaffOrSupport,
    formValues.show_inactive,
    formValues.scope_type,
    formValues.scope_name,
    formValues.role,
  ]);
  const props = useTable({
    table: 'UserAffiliationsList',
    syncFiltersToURL: true,
    fetchData: createFetcher(userPermissionsList),
    queryField: 'name',
    filter,
  });

  // The retry/clear button only makes sense once a query or filter is actually
  // narrowing the list; with none it is a dead end.
  const hasSearchOrFilters =
    Boolean(props.query) || props.filtersStorage?.length > 0;

  // Scope type, Active and Valid till hold a word, a check mark and a date:
  // sized to that, so the table fits the user details dialog instead of
  // pushing the role out of view behind the pinned actions.
  const columns = [
    {
      title: translate('Scope type'),
      render: ({ row }) => <>{formatRoleType(row.scope_type)}</>,
      filter: 'scope_type',
      width: '150px',
    },
    {
      title: translate('Scope name'),
      render: ({ row }) => {
        const link = getScopeLink(row);
        return link ? (
          <Link
            state={link.state}
            params={link.params}
            label={row.scope_name}
          />
        ) : (
          <>{formatScopeName(row)}</>
        );
      },
      filter: 'scope_name',
    },
    {
      title: translate('Organization'),
      render: ({ row }) =>
        row.scope_type === 'customer' ? (
          <Link
            state="organization.dashboard"
            params={{ uuid: row.scope_uuid }}
            label={row.scope_name}
          />
        ) : row.customer_uuid ? (
          <Link
            state="organization.dashboard"
            params={{ uuid: row.customer_uuid }}
            label={row.customer_name}
          />
        ) : (
          <>{DASH_ESCAPE_CODE}</>
        ),
    },
    {
      title: translate('Role name'),
      render: ({ row }) => <RolePopover roleName={row.role_name} />,
      filter: 'role',
    },
    ...(isStaffOrSupport
      ? [
          {
            title: translate('Active'),
            render: ({ row }) => <BooleanField value={row.is_active} />,
            filter: 'show_inactive',
            width: '80px',
          },
        ]
      : []),
    {
      title: translate('Valid till'),
      render: ({ row }) => (
        <>
          {row.expiration_time
            ? formatDate(row.expiration_time)
            : DASH_ESCAPE_CODE}
        </>
      ),
      width: '110px',
    },
  ];

  const canGrantRole = allowRoleGrant && Boolean(currentUser?.is_staff);
  const addRole = canGrantRole ? (
    <AddUserRoleButton user={user} refetch={props.fetch} />
  ) : null;
  const headerActions = (
    <>
      {hasActionBar && addRole}
      <UserAffiliationsDropdownActions />
    </>
  );

  return (
    <>
      {/* The details dialog has no toolbar, and its filter menu portals
          behind the dialog, so the filters are omitted there. Add still
          opens the grant dialog. The row is omitted when there is no button,
          so support does not get an empty gap above the table. */}
      {!hasActionBar && addRole && (
        <div className="flex justify-end mb-3">{addRole}</div>
      )}
      <Table
        {...props}
        columns={columns}
        formId="UserAffiliationsFilter"
        verboseName={translate('roles')}
        title={translate('Roles and permissions')}
        emptyMessage={translate(
          'Roles are granted by creating an organization or accepting an invitation to an organization or project.',
        )}
        placeholderActions={headerActions}
        placeholderHasRetry={hasSearchOrFilters}
        filters={
          hasActionBar ? (
            <UserAffiliationsFilter showRoleStatus={isStaffOrSupport} />
          ) : undefined
        }
        tableActions={headerActions}
        initialPageSize={10}
        expandableRow={UserAffiliationExpandableRow}
        rowActions={UserAffiliationsRowActions}
        hasActionBar={hasActionBar}
        fullWidth={fullWidth}
        cardBordered={cardBordered}
        enableMultiSelect={hasActionBar}
        multiSelectActions={
          hasActionBar ? UserAffiliationsBulkRemoveButton : undefined
        }
      />
    </>
  );
};

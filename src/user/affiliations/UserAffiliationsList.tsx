import { CheckCircleIcon, MinusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';
import { userPermissionsList, UserPermissionsListData } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { RoleEnum } from '@/permissions/enums';
import { formatRoleType } from '@/permissions/utils';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { RolePopover } from './RolePopover';
import { UserAffiliationExpandableRow } from './UserAffiliationExpandableRow';
import { UserAffiliationsBulkRemoveButton } from './UserAffiliationsBulkRemoveButton';
import { UserAffiliationsDropdownActions } from './UserAffiliationsDropdownActions';
import { UserAffiliationsFilter } from './UserAffiliationsFilter';
import { UserAffiliationsRowActions } from './UserAffiliationsRowActions';

interface UserAffiliationsListProps {
  user;
  hasActionBar?: boolean;
  fullWidth?: boolean;
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
> = ({ user, hasActionBar = true, fullWidth }) => {
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

  const columns = [
    {
      title: translate('Scope type'),
      render: ({ row }) => <>{formatRoleType(row.scope_type)}</>,
      filter: 'scope_type',
    },
    {
      title: translate('Scope name'),
      render: ({ row }) => {
        if (row.scope_type === 'project') {
          return (
            <Link
              state="project.dashboard"
              params={{ uuid: row.scope_uuid }}
              label={row.scope_name}
            />
          );
        }
        if (row.scope_type === 'resource') {
          return (
            <Link
              state="marketplace-resource-details"
              params={{ resource_uuid: row.scope_uuid }}
              label={row.scope_name}
            />
          );
        }
        if (row.scope_type === 'resource_project') {
          // ResourceProjects don't have a standalone page; deep-link to
          // the parent resource's Resource projects tab so the user can
          // expand the relevant row.
          return row.resource_uuid ? (
            <Link
              state="marketplace-resource-details"
              params={{
                resource_uuid: row.resource_uuid,
                tab: 'resource-projects',
              }}
              label={row.scope_name}
            />
          ) : (
            <>{row.scope_name}</>
          );
        }
        if (row.scope_type === 'call') {
          // Only the call manager can open the call management dashboard
          // (mirrors checkIsCallManager / the CallTabs "Manage" gate), so
          // link the scope name there only for that role.
          return row.role_name === RoleEnum.CALL_MANAGER ? (
            <Link
              state="protected-call.manage"
              params={{ call_uuid: row.scope_uuid }}
              label={row.scope_name}
            />
          ) : (
            <>{row.scope_name}</>
          );
        }
        return <>{row.scope_name}</>;
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
            render: ({ row }) =>
              row.is_active ? (
                <Tip label={translate('Active')} id={`active-${row.uuid}`}>
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-success"
                  />
                </Tip>
              ) : (
                <Tip label={translate('Revoked')} id={`active-${row.uuid}`}>
                  <MinusCircleIcon
                    size={20}
                    className="text-gray-500"
                    weight="bold"
                  />
                </Tip>
              ),
            filter: 'show_inactive',
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
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      formId="UserAffiliationsFilter"
      verboseName={translate('affiliations')}
      title={translate('Roles and permissions')}
      filters={<UserAffiliationsFilter showRoleStatus={isStaffOrSupport} />}
      tableActions={<UserAffiliationsDropdownActions />}
      initialPageSize={10}
      expandableRow={UserAffiliationExpandableRow}
      rowActions={UserAffiliationsRowActions}
      hasActionBar={hasActionBar}
      fullWidth={fullWidth}
      enableMultiSelect={hasActionBar}
      multiSelectActions={
        hasActionBar ? UserAffiliationsBulkRemoveButton : undefined
      }
    />
  );
};

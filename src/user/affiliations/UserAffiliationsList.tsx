import { uniqueId } from 'lodash-es';
import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { userPermissionsList, UserPermissionsListData } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { formatRoleType } from '@/permissions/utils';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { RolePopover } from './RolePopover';
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
}

const rowsParser = (data: any[]) => {
  if (!data?.length) return data;
  data.forEach((d) => Object.assign(d, { uuid: uniqueId() }));
  return data;
};

const UserAffiliationsListTable: FunctionComponent<
  UserAffiliationsListProps
> = ({ user, hasActionBar = true, fullWidth }) => {
  const { values } = useFormState();
  const formValues = (values as UserAffiliationsFilterValues) || {
    scope_type: undefined,
    scope_name: undefined,
    role: undefined,
  };
  const filter = useMemo(() => {
    const result: UserPermissionsListData['query'] = {
      user: user.uuid,
    };

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
    formValues.scope_type,
    formValues.scope_name,
    formValues.role,
  ]);
  const props = useTable({
    table: 'UserAffiliationsList',
    fetchData: createFetcher(userPermissionsList, {
      parser: rowsParser,
    }),
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
          <>N/A</>
        ),
    },
    {
      title: translate('Role name'),
      render: ({ row }) => <RolePopover roleName={row.role_name} />,
      filter: 'role',
    },
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
      filters={<UserAffiliationsFilter />}
      tableActions={<UserAffiliationsDropdownActions />}
      initialPageSize={10}
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

export const UserAffiliationsList: FunctionComponent<
  UserAffiliationsListProps
> = (props) => (
  <Form onSubmit={() => {}} subscription={{ values: true }}>
    {() => <UserAffiliationsListTable {...props} />}
  </Form>
);

import { FunctionComponent } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { formatRole, formatRoleType } from '@waldur/permissions/utils';
import { Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useTable } from '@waldur/table/utils';

interface UserAffiliationsListProps {
  user;
  hasActionBar?: boolean;
}

export const UserAffiliationsList: FunctionComponent<
  UserAffiliationsListProps
> = ({ user, hasActionBar = true }) => {
  const props = useTable({
    table: 'UserAffiliationsList',
    fetchData: () =>
      Promise.resolve({
        rows: user.permissions.sort((a, b) =>
          a.scope_type.localeCompare(b.scope_type),
        ),
        resultCount: user.permissions.length,
      }),
    queryField: 'name',
  });

  const columns = [
    {
      title: translate('Scope type'),
      render: ({ row }) => <>{formatRoleType(row.scope_type)}</>,
    },
    {
      title: translate('Scope name'),
      render: ({ row }) =>
        row.scope_type === 'project' ? (
          <Link
            state="project.dashboard"
            params={{ uuid: row.scope_uuid }}
            label={row.scope_name}
          />
        ) : (
          <>{row.scope_name}</>
        ),
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
      render: ({ row }) => <>{formatRole(row.role_name)}</>,
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
      verboseName={translate('affiliations')}
      title={translate('Roles and permissions')}
      initialPageSize={100}
      hasActionBar={hasActionBar}
    />
  );
};

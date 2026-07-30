import { ReactNode, useMemo } from 'react';

import Avatar from '@/core/Avatar';
import { ENV } from '@/core/config';
import { formatDate } from '@/core/dateUtils';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { GenericPermission } from '@/permissions/types';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table, { TableColumns } from '@/table/Table';
import { Column, TableProps } from '@/table/types';
import { MemberSyncStateIndicator } from '@/user/affiliations/MemberSyncStateIndicator';
import { RoleField } from '@/user/affiliations/RoleField';
import { exportRoleField } from '@/user/affiliations/RolePopover';

export const renderRoleExpirationDate = (row) => {
  return row.expiration_time
    ? formatDate(row.expiration_time)
    : DASH_ESCAPE_CODE;
};

/** All role names on a row — one per roles[] grant when the endpoint
 * provides them (resource team), else the scalar role_name. */
const getRowRoleNames = (row): string[] => {
  if (Array.isArray(row.roles) && row.roles.length > 0) {
    return row.roles.map((grant) => grant.role_name);
  }
  return row.role_name ? [row.role_name] : [];
};

const exportRowRoles = (row) =>
  getRowRoleNames(row)
    .map((name) => exportRoleField({ role_name: name }))
    .join(', ') || DASH_ESCAPE_CODE;

interface TeamTableComponentProps<T> extends TableProps<T> {
  context?: 'project' | 'organization' | 'resource_project';
  userFieldPrefix?: string;
  hideRole?: boolean;
  /** Hide the "Role expiration" column (e.g. reviewers, for whom the backend
   * omits expiration_time). */
  hideExpiration?: boolean;
  /**
   * Extra columns appended to the default Member/Email/Username/Role/Expiration
   * set. Useful for surfacing context-specific data per scope.
   */
  extraColumns?: Column<T>[];
  /**
   * Optional small inline hint rendered next to the role (or in place of
   * a missing role). The resource Team tab uses this to show
   * "in N projects" for users who only have sub-project grants.
   */
  roleSuffix?: (row: T) => ReactNode;
}

interface GenericTeamMember extends Partial<GenericPermission> {
  uuid?: string;
  username?: string;
  email?: string;
  image?: string;
  full_name?: string;
}

export const TeamTableComponent = <
  T extends GenericTeamMember = GenericTeamMember,
>({
  context,
  userFieldPrefix: prefix = '',
  hideRole,
  hideExpiration,
  extraColumns,
  roleSuffix,
  ...props
}: TeamTableComponentProps<T>) => {
  const getKey = (field) => (prefix + field) as keyof GenericTeamMember;
  const getField = (row, field) => row[getKey(field)];

  const columns = useMemo<TableColumns<T>>(
    () => [
      {
        title: translate('Member'),
        render: ({ row }) => (
          <div className="content-wrapper gap-2">
            <Avatar
              name={getField(row, 'full_name')}
              src={getField(row, 'image')}
              circle
              size={32}
            />
            <p className="mb-0">
              {getField(row, 'full_name') || DASH_ESCAPE_CODE}
            </p>
          </div>
        ),

        export: getKey('full_name'),
        id: 'member',
        keys: [getKey('full_name'), getKey('username'), getKey('image')],
        copyField: (row) => getField(row, 'full_name'),
      },
      {
        title: translate('Email'),
        render: ({ row }) => getField(row, 'email') || DASH_ESCAPE_CODE,
        export: getKey('email'),
        id: 'email',
        keys: [getKey('email')],
        copyField: (row) => getField(row, 'email'),
      },
      {
        title: translate('Username'),
        render: ({ row }) => getField(row, 'username'),
        export: getKey('username'),
        id: 'username',
        keys: [getKey('username')],
        optional: !isFeatureVisible(UserFeatures.show_username),
        copyField: (row) => getField(row, 'username'),
      },
      !hideRole && {
        title:
          context === 'organization'
            ? translate('Role in organization')
            : context === 'project'
              ? translate('Role in project')
              : translate('Role'),
        render: ({ row }) => {
          const suffix = roleSuffix ? roleSuffix(row as T) : null;
          // The resource team endpoint returns every resource-scope
          // grant in roles[]; render one badge per grant. Other
          // contexts only provide the scalar role_name.
          const roles = (row as any).roles;
          return (
            <span className="d-inline-flex align-items-center gap-2 flex-wrap">
              {Array.isArray(roles) && roles.length > 0 ? (
                roles.map((grant) => (
                  <span
                    key={grant.role_uuid}
                    className="d-inline-flex align-items-center gap-1"
                  >
                    <RoleField row={grant} />
                    <MemberSyncStateIndicator grant={grant} />
                  </span>
                ))
              ) : (
                <RoleField row={row} />
              )}
              {suffix && <span className="text-muted small">{suffix}</span>}
            </span>
          );
        },
        className: 'w-25',
        filter:
          context === 'organization'
            ? 'organization_role'
            : context === 'project'
              ? 'project_role'
              : 'role',
        inlineFilter: (row) =>
          ENV.roles.filter((role) => getRowRoleNames(row).includes(role.name)),
        export: exportRowRoles,
        id: 'role_name',
        keys: ['role_name'],
      },
      !hideExpiration && {
        title: translate('Role expiration'),
        render: ({ row }) => renderRoleExpirationDate(row),
        className: 'w-45px',
        export: (row) => renderRoleExpirationDate(row),
        id: 'expiration_time',
        keys: ['expiration_time'],
      },
      ...(extraColumns ?? []),
    ],
    [context, extraColumns, roleSuffix, hideRole, hideExpiration],
  );

  return (
    <Table<T>
      title={translate('Team')}
      columns={columns}
      verboseName={translate('team members')}
      hasQuery={true}
      enableExport
      hasOptionalColumns
      showPageSizeSelector
      {...props}
    />
  );
};

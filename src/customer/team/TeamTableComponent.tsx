import { ReactNode, useMemo } from 'react';

import Avatar from '@/core/Avatar';
import { ENV } from '@/core/config';
import { formatDate } from '@/core/dateUtils';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { GenericPermission } from '@/permissions/types';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column, TableProps } from '@/table/types';
import { RoleField } from '@/user/affiliations/RoleField';
import { exportRoleField } from '@/user/affiliations/RolePopover';

export const renderRoleExpirationDate = (row) => {
  return row.expiration_time
    ? formatDate(row.expiration_time)
    : DASH_ESCAPE_CODE;
};

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

  const columns = useMemo(
    () =>
      [
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
            return (
              <span className="d-inline-flex align-items-center gap-2">
                <RoleField row={row} />
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
            ENV.roles.filter((role) => role.name === row.role_name),
          export: exportRoleField,
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
      ].filter(Boolean) as Column<T>[],
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

import { cloneDeep } from 'lodash';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { RoleEnum } from '@waldur/permissions/enums';
import { formatRole } from '@waldur/permissions/utils';
import { BooleanField } from '@waldur/table/BooleanField';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { Table, createFetcher } from '@waldur/table/index';
import { useTable } from '@waldur/table/utils';
import { User } from '@waldur/workspace/types';

import { UserDetailsButton } from './UserDetailsButton';
import { UserFilter } from './UserFilter';
import { UserTableActions } from './UserTableActions';

const renderFieldOrDash = (field) => {
  return field ? field : DASH_ESCAPE_CODE;
};

const PhoneNumberField = ({ row }) => (
  <>{renderFieldOrDash(row.phone_number)}</>
);

const EmailField = ({ row }) => <>{renderFieldOrDash(row.email)}</>;

const FullNameField = ({ row }) => <>{renderFieldOrDash(row.full_name)}</>;

const OrganizationField = ({ row }) => (
  <>{renderFieldOrDash(row.organization)}</>
);

const StaffStatusField = ({ row }) => {
  return <BooleanField value={row.is_staff} />;
};

const UserStatusField = ({ row }) => {
  return <BooleanField value={row.is_active} />;
};

const OrganizationRolesField = ({ row }) => {
  const permissions = row.permissions?.filter(
    ({ scope_type }) => scope_type === 'customer',
  );
  if (permissions.length > 0) {
    return permissions.map((permission, index) => (
      <span key={index}>
        <Tip
          key={index}
          label={formatRole(permission.role_name)}
          id="customer-role"
        >
          {permission.scope_name} <i className="fa fa-question-circle" />
        </Tip>
        <br />
      </span>
    ));
  } else {
    return DASH_ESCAPE_CODE;
  }
};

const ProjectRolesField = ({ row }) => {
  const permissions = row.permissions?.filter(
    ({ scope_type }) => scope_type === 'project',
  );
  if (permissions.length > 0) {
    return permissions.map((permission, index) => (
      <span key={index}>
        <Tip
          key={index}
          label={translate('{role} ({name})', {
            role: formatRole(permission.role_name),
            name: permission.customer_name,
          })}
          id="project-role"
        >
          {permission.scope_name} <i className="fa fa-question-circle" />
        </Tip>
        <br />
      </span>
    ));
  } else {
    return DASH_ESCAPE_CODE;
  }
};

const SupportStatusField = ({ row }) => {
  return <BooleanField value={row.is_support} />;
};

const mapStateToFilter = createSelector(
  getFormValues('userFilter'),
  (filters: any) => {
    const params = cloneDeep(formatRoleFilter(filters));
    if (filters?.organization?.uuid) {
      params.customer_uuid = filters.organization.uuid;
    }
    if (params?.organization) {
      delete params.organization;
    }
    return params;
  },
);

export const UserList: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: `userList`,
    fetchData: createFetcher('users'),
    queryField: 'query',
    filter,
    exportFields: [
      'Full name',
      'Username',
      'Email',
      'Phone number',
      'Organization',
      'Organizations owner',
    ],
    exportAll: true,
    exportRow: (row) => [
      row.full_name,
      row.username,
      row.email,
      row.phone_number,
      row.organization,
      getOrganizationsWhereOwner(row),
    ],
    exportKeys: [
      'full_name',
      'username',
      'email',
      'phone_number',
      'organization',
      'customer_permissions',
    ],
  });

  return (
    <Table
      {...props}
      filters={<UserFilter />}
      columns={[
        {
          title: translate('Full name'),
          render: FullNameField,
          orderField: 'full_name',
        },
        {
          title: translate('Email'),
          render: EmailField,
          orderField: 'email',
        },
        {
          title: translate('Phone number'),
          render: PhoneNumberField,
          orderField: 'phone_number',
        },
        {
          title: translate('Organization'),
          render: OrganizationField,
        },
        {
          title: translate('Organization roles'),
          render: OrganizationRolesField,
        },
        {
          title: translate('Project roles'),
          render: ProjectRolesField,
        },
        {
          title: translate('Staff'),
          render: StaffStatusField,
          className: 'text-center',
        },
        {
          title: translate('Support'),
          render: SupportStatusField,
          className: 'text-center',
        },
        {
          title: translate('Status'),
          render: UserStatusField,
          className: 'text-center',
        },
      ]}
      hoverableRow={UserDetailsButton}
      showPageSizeSelector={true}
      verboseName={translate('users')}
      enableExport={true}
      actions={<UserTableActions refetch={props.fetch} />}
      hasQuery={true}
    />
  );
};

export const formatRoleFilter = (filter) => {
  if (filter && filter.role) {
    const formattedRole = {};
    filter.role.map((item) => {
      formattedRole[item.value] = true;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { role, ...rest } = filter;
    return {
      ...rest,
      ...formattedRole,
    };
  }
  return filter;
};

export const getOrganizationsWhereOwner = (user: Partial<User>) =>
  user.permissions
    .filter((perm) => perm.role_name === RoleEnum.CUSTOMER_OWNER)
    .map((perm) => perm.scope_name)
    .join(', ');

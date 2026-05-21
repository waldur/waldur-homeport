import { QuestionIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { User, usersList, UsersListData } from 'waldur-js-client';

import { AITokenExpandableRow } from '@/administration/ai-assistant/AITokenExpandableRow';
import { ENV } from '@/core/config';
import { formatDate, formatDateTime } from '@/core/dateUtils';
import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
import { formatPhoneNumber } from '@/core/utils';
import { isFeatureVisible } from '@/features/connect';
import { SupportFeatures, UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { RoleEnum } from '@/permissions/enums';
import { formatRole } from '@/permissions/utils';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { IsdBadges } from './IsdBadges';
import { RecalculateUserActionsButton } from './RecalculateUserActionsButton';
import { UserBulkActions } from './UserBulkActions';
import { UserDetailsButton } from './UserDetailsButton';
import { UserEditButton } from './UserEditButton';
import { UserFilter } from './UserFilter';
import { UserImpersonateButton } from './UserImpersonateButton';
import { UserTableActions } from './UserTableActions';

const renderFieldOrDash = (field) => {
  return field ? field : DASH_ESCAPE_CODE;
};

const PhoneNumberField = ({ row }: { row: User }) => (
  <>{renderFieldOrDash(formatPhoneNumber(row.phone_number))}</>
);

const EmailField = ({ row }: { row: User }) => (
  <>{renderFieldOrDash(row.email)}</>
);

const FullNameField = ({ row }: { row: User }) => (
  <Link
    state="support-user-manage"
    params={{ user_uuid: row.uuid }}
    label={renderFieldOrDash(row.full_name)}
  />
);

const OrganizationField = ({ row }: { row: User }) => (
  <>{renderFieldOrDash(row.organization)}</>
);

const StaffStatusField = ({ row }: { row: User }) => {
  return <BooleanField value={row.is_staff} />;
};

const UserStatusField = ({ row }: { row: User }) => {
  return <BooleanField value={row.is_active} />;
};

const OrganizationRolesField = ({ row }: { row: User }) => {
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
          {permission.scope_name} <QuestionIcon weight="bold" />
        </Tip>
        <br />
      </span>
    ));
  } else {
    return DASH_ESCAPE_CODE;
  }
};

const ProjectRolesField = ({ row }: { row: User }) => {
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
          {permission.scope_name} <QuestionIcon weight="bold" />
        </Tip>
        <br />
      </span>
    ));
  } else {
    return DASH_ESCAPE_CODE;
  }
};

const SupportStatusField = ({ row }: { row: User }) => {
  return <BooleanField value={row.is_support} />;
};

const renderListOrDash = (list) => {
  return (
    <>
      {list && list.length > 0
        ? list.map((item, index) => <div key={index}>{item}</div>)
        : DASH_ESCAPE_CODE}
    </>
  );
};
const RowActions = ({ row, fetch }: { row: User; fetch? }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        UserEditButton,
        RecalculateUserActionsButton,
        UserImpersonateButton,
        UserDetailsButton,
      ]}
    />
  );
};

const DEFAULT_ENABLED_COLUMNS = [
  'full_name',
  'email',
  'phone_number',
  'organization',
  'organization_roles',
  'project_roles',
  'is_active',
];

const mandatoryFields: UsersListData['query']['field'] = [
  'uuid',
  // UserDetailsButton
  'full_name',
  'first_name',
  'last_name',
  'native_name',
  'civil_number',
  'phone_number',
  'username',
  'email',
  'slug',
  'preferred_language',
  'identity_provider_label',
  'date_joined',
  'organization',
  'job_title',
  'affiliations',
  'is_staff',
  'is_support',
  'is_active',
  'url',
  'permissions',
  'has_active_session',
  'active_isds',
  'is_identity_manager',
  'has_usable_password',
  // UserEditButton (edit dialog needs these fields)
  'description',
  'personal_title',
  'gender',
  'place_of_birth',
  'country_of_residence',
  'nationality',
  'nationalities',
  'organization_country',
  'organization_type',
  'organization_registry_code',
];

const UserListTable: FunctionComponent = () => {
  const { values } = useFormState();
  const filters = values;

  useEffect(() => {
    if (filters) {
      syncFiltersToURL(filters);
    }
  }, [filters]);

  const filter = useMemo(() => {
    const roleFilter = formatRoleFilter(filters?.role) || {};
    const filterObj: Record<string, string | boolean | string[]> = {};

    if (filters?.organization?.uuid) {
      filterObj.customer_uuid = filters.organization.uuid;
    }
    if (filters?.project_role) {
      filterObj.project_roles = filters.project_role.map(({ name }) => name);
    }
    if (filters?.organization_role) {
      filterObj.organization_roles = filters.organization_role.map(
        ({ name }) => name,
      );
    }
    if (filters?.is_active !== undefined && filters?.is_active !== '') {
      filterObj.is_active = filters.is_active;
    }

    return { ...filterObj, ...roleFilter };
  }, [filters]);

  const props = useTable({
    table: `userList`,
    fetchData: createFetcher(usersList),
    queryField: 'query',
    filter,
    mandatoryFields,
  });

  const columns: Column<User>[] = [
    {
      title: translate('Full name'),
      render: FullNameField,
      orderField: 'full_name',
      keys: ['full_name'],
      id: 'full_name',
      copyField: (row) => row.full_name,
    },
    {
      title: translate('Username'),
      render: ({ row }) => renderFieldOrDash(row.username),
      copyField: (row) => row.username,
      keys: ['username'],
      id: 'username',
      optional: !isFeatureVisible(UserFeatures.show_username),
    },
    {
      title: translate('Email'),
      render: EmailField,
      orderField: 'email',
      keys: ['email'],
      id: 'email',
      copyField: (row) => row.email,
    },
    {
      title: translate('Phone number'),
      render: PhoneNumberField,
      orderField: 'phone_number',
      keys: ['phone_number'],
      id: 'phone_number',
    },
    {
      title: translate('Organization'),
      render: OrganizationField,
      orderField: 'organization',
      filter: 'organization',
      keys: ['organization'],
      id: 'organization',
      export: 'organization',
    },
    {
      title: translate('Organization roles'),
      render: OrganizationRolesField,
      keys: ['permissions'],
      id: 'organization_roles',
      filter: 'organization_role',
      exportTitle: translate('Organizations owner'),
      export: (row) => getOrganizationsWhereOwner(row),
    },
    {
      title: translate('Project roles'),
      render: ProjectRolesField,
      keys: ['permissions'],
      id: 'project_roles',
      filter: 'project_role',
      export: (row) => getProjectRole(row),
    },
    {
      title: translate('Staff'),
      render: StaffStatusField,
      className: 'text-center',
      keys: ['is_staff'],
      id: 'is_staff',
      export: (row) => (row.is_staff ? translate('Yes') : translate('No')),
    },
    {
      title: translate('Support'),
      render: SupportStatusField,
      className: 'text-center',
      keys: ['is_support'],
      id: 'is_support',
      export: (row) => (row.is_support ? translate('Yes') : translate('No')),
    },
    {
      title: translate('Password'),
      render: ({ row }) => <BooleanField value={row.has_usable_password} />,
      className: 'text-center',
      keys: ['has_usable_password'],
      id: 'has_usable_password',
      export: (row) =>
        row.has_usable_password ? translate('Yes') : translate('No'),
    },
    {
      title: translate('Status'),
      render: UserStatusField,
      className: 'text-center',
      keys: ['is_active'],
      filter: 'is_active',
      id: 'is_active',
      export: (row) =>
        row.is_active ? translate('Active') : translate('Inactive'),
    },
    {
      title: translate('Affiliations'),
      render: ({ row }) => renderListOrDash(row.affiliations),
      keys: ['affiliations'],
      id: 'affiliations',
    },
    {
      title: translate('Civil number'),
      render: ({ row }) => renderFieldOrDash(row.civil_number),
      keys: ['civil_number'],
      id: 'civil_number',
    },
    {
      title: translate('Job title'),
      render: ({ row }) => renderFieldOrDash(row.job_title),
      keys: ['job_title'],
      id: 'job_title',
    },
    {
      title: translate('Date joined'),
      render: ({ row }) => formatDateTime(row.date_joined),
      keys: ['date_joined'],
      id: 'date_joined',
      export: (row) => formatDateTime(row.date_joined),
    },
    {
      title: translate('Birth date'),
      render: ({ row }) =>
        row.birth_date ? formatDate(row.birth_date) : DASH_ESCAPE_CODE,
      keys: ['birth_date'],
      id: 'birth_date',
      export: (row) =>
        row.birth_date ? formatDate(row.birth_date) : DASH_ESCAPE_CODE,
    },
    {
      title: translate('Agreement date'),
      render: ({ row }) => formatDateTime(row.agreement_date),
      keys: ['agreement_date'],
      id: 'agreement_date',
      export: (row) => formatDateTime(row.agreement_date),
    },
    {
      title: translate('UUID'),
      render: ({ row }) => <>{row.uuid}</>,
      keys: ['uuid'],
      id: 'uuid',
    },
    {
      title: translate('Description'),
      render: ({ row }) => renderFieldOrDash(row.description),
      keys: ['description'],
      id: 'description',
    },
    {
      title: translate('Identity provider name'),
      render: ({ row }) => renderFieldOrDash(row.identity_provider_name),
      keys: ['identity_provider_name'],
      id: 'identity_provider_name',
    },
    {
      title: translate('Identity provider fields'),
      render: ({ row }) => renderListOrDash(row.identity_provider_fields),
      keys: ['identity_provider_fields'],
      id: 'identity_provider_fields',
    },
    {
      title: translate('Requested email'),
      render: ({ row }) => renderFieldOrDash(row.requested_email),
      keys: ['requested_email'],
      id: 'requested_email',
    },
    {
      title: translate('Registration method'),
      render: ({ row }) => renderFieldOrDash(row.registration_method),
      keys: ['registration_method'],
      id: 'registration_method',
    },
    {
      title: translate('Preferred language'),
      render: ({ row }) => renderFieldOrDash(row.preferred_language),
      keys: ['preferred_language'],
      id: 'preferred_language',
    },
  ];

  if (isFeatureVisible(UserFeatures.show_slug)) {
    columns.push({
      title: translate('Shortname'),
      render: ({ row }) => row.slug,
      keys: ['slug'],
      id: 'slug',
    });
  }

  if (isFeatureVisible(UserFeatures.show_identity_bridge)) {
    columns.push(
      {
        title: translate('Active ISDs'),
        render: ({ row }) => (
          <IsdBadges isds={(row.active_isds as string[]) || []} />
        ),
        keys: ['active_isds'],
        id: 'active_isds',
        optional: true,
      },
      {
        title: translate('Identity manager'),
        render: ({ row }) => <BooleanField value={row.is_identity_manager} />,
        keys: ['is_identity_manager'],
        id: 'is_identity_manager',
        optional: true,
      },
    );
  }

  const validColumns = columns.map((column) => column.id);
  const enabledColumns = ENV.plugins.WALDUR_CORE.USER_TABLE_COLUMNS
    ? ENV.plugins.WALDUR_CORE.USER_TABLE_COLUMNS.split(',')
        .map((column) => column.trim())
        .filter((column) => validColumns.includes(column))
    : DEFAULT_ENABLED_COLUMNS;
  if (enabledColumns) {
    columns.forEach((column) => {
      if (column.id !== 'username') {
        column.optional = !enabledColumns.includes(column.id);
      }
    });
  }

  const aiAssistantEnabled = isFeatureVisible(
    SupportFeatures.enable_llm_assistant,
  );

  const expandableRow = useCallback(
    ({ row }) => (
      <AITokenExpandableRow
        row={row}
        refetch={props.fetch}
        isTableRefreshing={props.loading}
      />
    ),
    [props.fetch, props.loading],
  );

  return (
    <Table
      {...props}
      formId="userFilter"
      filters={<UserFilter />}
      columns={columns}
      rowActions={RowActions}
      showPageSizeSelector={true}
      hasOptionalColumns
      verboseName={translate('users')}
      enableExport={true}
      tableActions={<UserTableActions refetch={props.fetch} />}
      enableMultiSelect
      multiSelectActions={UserBulkActions}
      hasQuery={true}
      expandableRow={aiAssistantEnabled ? expandableRow : undefined}
      isRowExpandable={
        aiAssistantEnabled ? (row) => !!row.is_active : undefined
      }
    />
  );
};

export const UserList: FunctionComponent = () => {
  const initialValues = useMemo(() => getInitialValues(), []);
  return (
    <Form
      onSubmit={() => {}}
      subscription={{ values: true }}
      initialValues={initialValues}
    >
      {() => <UserListTable />}
    </Form>
  );
};

export const formatRoleFilter = (roles) => {
  if (roles) {
    const formattedRole = {};
    roles.map((item) => {
      formattedRole[item.value] = true;
    });
    return formattedRole;
  }
  return roles;
};

export const getOrganizationsWhereOwner = (user: Partial<User>) =>
  user.permissions
    ? user.permissions
        .filter((perm) => perm.role_name === RoleEnum.CUSTOMER_OWNER)
        .map((perm) => perm.scope_name)
        .join(', ')
    : DASH_ESCAPE_CODE;

export const getProjectRole = (user: Partial<User>) => {
  const permissions = user.permissions?.filter(
    ({ scope_type }) => scope_type === 'project',
  );
  if (permissions.length > 0) {
    return permissions
      .map(
        (p) =>
          `${p.customer_name}/${p.scope_name} (${formatRole(p.role_name)})`,
      )
      .join(', ');
  } else {
    return DASH_ESCAPE_CODE;
  }
};

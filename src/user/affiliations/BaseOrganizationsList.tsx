import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { OrganizationsFilter } from '@waldur/administration/organizations/OrganizationsFilter';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { RIGHT_ARROW_HTML } from '@waldur/customer/list/constants';
import { OrganizationCreateButton } from '@waldur/customer/list/OrganizationCreateButton';
import { translate } from '@waldur/i18n';
import { CountryFlag } from '@waldur/marketplace/common/CountryFlag';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { SLUG_COLUMN } from '@waldur/table/slug';
import { useTable } from '@waldur/table/utils';
import { checkCustomerUser, getUser } from '@waldur/workspace/selectors';

import { CUSTOMERS_FILTER_FORM_ID } from '../constants';

const OrganizationField = ({ row }) => {
  const user = useSelector(getUser);
  const hasOrganizationPermission = checkCustomerUser(row, user);
  const hasProjectPermission = user.permissions.find(
    (permission) =>
      permission.scope_type === 'project' &&
      permission.customer_uuid === row.uuid,
  );
  return hasOrganizationPermission ? (
    <Link
      state="organization.dashboard"
      params={{ uuid: row.uuid }}
      label={row.name}
    />
  ) : hasProjectPermission ? (
    <Link
      state="marketplace-projects"
      params={{ uuid: row.uuid }}
      label={row.name}
    />
  ) : (
    <>{row.name}</>
  );
};

export const BaseOrganizationsList: FunctionComponent<{
  user;
  standalone?;
}> = ({ user, standalone = false }) => {
  const filter = useSelector(mapStateToFilter);
  filter.user_uuid = user.uuid;

  const props = useTable({
    table: 'customerList',
    fetchData: createFetcher('customers'),
    queryField: 'name',
    filter,
  });

  const columns = [
    {
      title: translate('Organization'),
      orderField: 'name',
      render: OrganizationField,
      keys: ['name'],
      id: 'organization',
    },
    {
      title: translate('UUID'),
      render: ({ row }) => <>{row.uuid}</>,
      keys: ['uuid'],
      optional: true,
      id: 'uuid',
    },
    {
      title: translate('Abbreviation'),
      orderField: 'abbreviation',
      render: ({ row }) => <>{row.abbreviation || DASH_ESCAPE_CODE}</>,
      keys: ['abbreviation'],
      id: 'abbreviation',
    },
    {
      title: translate('Organization group'),
      render: ({ row }) => (
        <>
          {row.organization_group_parent_name && (
            <>
              {row.organization_group_parent_name} {RIGHT_ARROW_HTML}{' '}
            </>
          )}
          {row.organization_group_name}
        </>
      ),
      keys: ['organization_group_name', 'organization_group_parent_name'],
      optional: true,
      filter: 'organization_group',
      id: 'organization_group',
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.email || DASH_ESCAPE_CODE}</>,
      keys: ['email'],
      id: 'email',
    },
    {
      title: translate('Agreement number'),
      render: ({ row }) => <>{row.agreement_number || DASH_ESCAPE_CODE}</>,
      keys: ['agreement_number'],
      optional: true,
      id: 'agreement_number',
    },
    {
      title: translate('Projects'),
      render: ({ row }) => <>{row.projects_count || 0}</>,
      keys: ['projects_count'],
      id: 'projects',
    },
    {
      title: translate('Created'),
      orderField: 'created',
      render: ({ row }) => <>{formatDate(row.created)}</>,
      keys: ['created'],
      id: 'created',
      export: (row) => formatDateTime(row.created),
    },
    {
      title: translate('Contact details'),
      render: ({ row }) => <>{row.contact_details || DASH_ESCAPE_CODE}</>,
      keys: ['contact_details'],
      optional: true,
      id: 'contact_details',
    },
    {
      title: translate('Country'),
      render: ({ row }) =>
        row.country ? (
          <CountryFlag countryCode={row.country} />
        ) : (
          DASH_ESCAPE_CODE
        ),
      keys: ['country'],
      optional: true,
      id: 'country',
    },
    {
      title: translate('Address'),
      render: ({ row }) => <>{row.address || DASH_ESCAPE_CODE}</>,
      keys: ['address'],
      optional: true,
      id: 'address',
    },
    {
      title: translate('Postal'),
      render: ({ row }) => <>{row.postal || DASH_ESCAPE_CODE}</>,
      keys: ['postal'],
      optional: true,
      id: 'postal',
    },
    {
      title: translate('Phone number'),
      render: ({ row }) => <>{row.phone_number || DASH_ESCAPE_CODE}</>,
      keys: ['phone_number'],
      optional: true,
      id: 'phone_number',
    },
    {
      title: translate('Access subnets'),
      render: ({ row }) => <>{row.access_subnets || DASH_ESCAPE_CODE}</>,
      keys: ['access_subnets'],
      optional: true,
      id: 'access_subnets',
    },
    {
      title: translate('Accounting start date'),
      render: ({ row }) => (
        <>
          {row.accounting_start_date
            ? formatDateTime(row.accounting_start_date)
            : DASH_ESCAPE_CODE}
        </>
      ),
      keys: ['accounting_start_date'],
      optional: true,
      id: 'accounting_start_date',
    },
    {
      title: translate('Bank account'),
      render: ({ row }) => <>{row.bank_account || DASH_ESCAPE_CODE}</>,
      keys: ['bank_account'],
      optional: true,
      id: 'bank_account',
    },
    {
      title: translate('Bank name'),
      render: ({ row }) => <>{row.bank_name || DASH_ESCAPE_CODE}</>,
      keys: ['bank_name'],
      optional: true,
      id: 'bank_name',
    },
    {
      title: translate('Default tax percent'),
      render: ({ row }) => <>{row.default_tax_percent || DASH_ESCAPE_CODE}</>,
      keys: ['default_tax_percent'],
      optional: true,
      id: 'default_tax_percent',
    },
    {
      title: translate('Registration code'),
      render: ({ row }) => <>{row.registration_code || DASH_ESCAPE_CODE}</>,
      keys: ['registration_code'],
      optional: true,
      id: 'registration_code',
    },
    {
      title: translate('VAT code'),
      render: ({ row }) => <>{row.vat_code || DASH_ESCAPE_CODE}</>,
      keys: ['vat_code'],
      optional: true,
      id: 'vat_code',
    },
    {
      title: translate('Domain'),
      render: ({ row }) => <>{row.domain || DASH_ESCAPE_CODE}</>,
      keys: ['domain'],
      optional: true,
      id: 'domain',
    },
    {
      title: translate('Is service provider'),
      render: ({ row }) => (
        <>{row.is_service_provider ? translate('Yes') : translate('No')}</>
      ),
      keys: ['is_service_provider'],
      optional: true,
      filter: 'is_service_provider',
      id: 'is_service_provider',
    },
    SLUG_COLUMN,
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('organizations')}
      title={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      standalone={standalone}
      tableActions={<OrganizationCreateButton />}
      filters={<OrganizationsFilter />}
      hasOptionalColumns
    />
  );
};

const mapStateToFilter = createSelector(
  getFormValues(CUSTOMERS_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: Record<string, string | string[]> = {};
    if (filterValues?.accounting_is_running) {
      filter.accounting_is_running = filterValues.accounting_is_running.value;
    }
    if (filterValues?.is_service_provider) {
      filter.is_service_provider = filterValues.is_service_provider.value;
    }
    if (filterValues?.organization_group_type) {
      filter.organization_group_type_uuid =
        filterValues.organization_group_type.map((option) => option.uuid);
    }
    if (filterValues?.organization_group) {
      filter.organization_group_uuid = filterValues.organization_group.uuid;
    }
    return filter;
  },
);

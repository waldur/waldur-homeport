import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { Customer, CustomersListData } from 'waldur-js-client';

import { OrganizationsFilter } from '@waldur/administration/organizations/OrganizationsFilter';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { OrganizationCard } from '@waldur/customer/list/OrganizationCard';
import { OrganizationCreateButton } from '@waldur/customer/list/OrganizationCreateButton';
import { OrganizationLink } from '@waldur/customer/list/OrganizationLink';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { CountryFlag } from '@waldur/marketplace/common/CountryFlag';
import { useOrganizationAndProjectFiltersForResources } from '@waldur/navigation/sidebar/resources-filter/utils';
import { useTitle } from '@waldur/navigation/title';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { SLUG_COLUMN } from '@waldur/table/slug';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';

import { CUSTOMERS_FILTER_FORM_ID } from '../constants';

import { OrganizationExpandableRow } from './OrganizationExpandableRow';

const mapStateToFilter = createSelector(
  getFormValues(CUSTOMERS_FILTER_FORM_ID),
  getUser,
  (filterValues: any, user) => {
    const filter: Record<string, string | string[]> = {};
    if (filterValues?.accounting_is_running) {
      filter.accounting_is_running = filterValues.accounting_is_running.value;
    }
    if (filterValues?.is_service_provider) {
      filter.is_service_provider = filterValues.is_service_provider.value;
    }
    if (filterValues?.organization_group) {
      filter.organization_group_uuid = filterValues.organization_group.uuid;
    }
    if (filterValues?.is_call_managing_organization) {
      filter.is_call_managing_organization =
        filterValues.is_call_managing_organization;
    }
    filter.user_uuid = user.uuid;
    return filter;
  },
);

const mandatoryFields: CustomersListData['query']['field'] = [
  // Grid view
  'uuid',
  'name',
  'email',
  'image',
  'created',
  'customer_credit',
  'billing_price_estimate',
  'organization_groups',
  'url', // Expand view - to create project
];

export const OrganizationsList: FunctionComponent = () => {
  useTitle(translate('Organizations'), '', 'browser');

  const filter = useSelector(mapStateToFilter);

  const props = useTable({
    table: 'customerList',
    fetchData: createFetcher('customers'),
    queryField: 'query',
    filter,
    mandatoryFields,
  });

  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources();

  const onClickDetails = (row) =>
    syncResourceFilters({ organization: row, project: null });

  const columns: Array<Column<Customer>> = [
    {
      title: translate('Organization'),
      orderField: 'name',
      render: ({ row }) => (
        <OrganizationLink uuid={row.uuid} onClick={() => onClickDetails(row)}>
          {row.name}
        </OrganizationLink>
      ),

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
      title: translate('Backend ID'),
      render: ({ row }) => renderFieldOrDash(row.backend_id),
      keys: ['backend_id'],
      optional: true,
      id: 'backend_id',
    },
    {
      title: translate('Abbreviation'),
      orderField: 'abbreviation',
      render: ({ row }) => <>{row.abbreviation || DASH_ESCAPE_CODE}</>,
      keys: ['abbreviation'],
      id: 'abbreviation',
    },
    {
      title: translate('Organization groups'),
      render: ({ row }) =>
        row.organization_groups
          ?.map(
            (group) =>
              `${group.parent_name ? `${group.parent_name} ➔ ` : ''}${group.name}`,
          )
          .join(', '),

      keys: ['organization_groups'],
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
    SLUG_COLUMN as Column<Customer>,
  ];

  if (
    isFeatureVisible(MarketplaceFeatures.show_call_management_functionality)
  ) {
    columns.push({
      title: translate('Is call managing organization'),
      render: ({ row }) => (
        <>
          {row.call_managing_organization_uuid
            ? translate('Yes')
            : translate('No')}
        </>
      ),

      keys: ['call_managing_organization_uuid'],
      optional: true,
      filter: 'is_call_managing_organization',
      id: 'call_managing_organization_uuid',
    });
  }

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('organizations')}
      title={translate('Organizations')}
      gridSize={{ md: 6, xl: 4 }}
      gridItem={({ row }) => (
        <OrganizationCard
          organization={row as any}
          onClickDetails={() => onClickDetails(row)}
        />
      )}
      hoverShadow={{ grid: false }}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      standalone
      tableActions={<OrganizationCreateButton />}
      filters={<OrganizationsFilter />}
      hasOptionalColumns
      expandableRowClassName="py-2 pe-2"
      expandableRow={OrganizationExpandableRow}
    />
  );
};

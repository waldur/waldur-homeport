import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { OrganizationsFilter } from '@waldur/administration/organizations/OrganizationsFilter';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { OrganizationCreateButton } from '@waldur/customer/list/OrganizationCreateButton';
import { OrganizationDetails } from '@waldur/customer/list/OrganizationDetails';
import { OrganizationEditButton } from '@waldur/customer/list/OrganizationEditButton';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { checkCustomerUser, getUser } from '@waldur/workspace/selectors';

import { CUSTOMERS_FILTER_FORM_ID } from '../constants';

import { OrganizationHoverableRow } from './OrganizationHoverableRow';

const exportRow = (row) => [
  row.name,
  row.email || DASH_ESCAPE_CODE,
  row.organization_group_name || DASH_ESCAPE_CODE,
  row.projects_count || 0,
  formatDateTime(row.created),
];

const exportFields = [
  'Name',
  'Email',
  'Organization group',
  'Projects',
  'Created',
];

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
  hasActionBar?;
  standalone?;
}> = ({ user, hasActionBar = true, standalone = false }) => {
  const filter = useSelector(mapStateToFilter);
  filter.user_uuid = user.uuid;

  const props = useTable({
    table: 'customerList',
    fetchData: createFetcher('customers'),
    queryField: 'name',
    filter,
    exportRow,
    exportFields,
  });

  const columns = [
    {
      title: translate('Organization'),
      orderField: 'name',
      render: OrganizationField,
    },
    {
      title: translate('Abbreviation'),
      orderField: 'abbreviation',
      render: ({ row }) => <>{row.abbreviation || DASH_ESCAPE_CODE}</>,
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.email || DASH_ESCAPE_CODE}</>,
    },
    {
      title: translate('Projects'),
      render: ({ row }) => <>{row.projects_count || 0}</>,
    },
    {
      title: translate('Created'),
      orderField: 'created',
      render: ({ row }) => <>{renderFieldOrDash(formatDate(row.created))}</>,
    },
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
      hoverableRow={({ row }) => (
        <>
          <OrganizationHoverableRow row={row} />
          <OrganizationEditButton customer={row} />
        </>
      )}
      expandableRow={({ row }) => <OrganizationDetails customer={row} />}
      fullWidth={true}
      hasActionBar={hasActionBar}
      standalone={standalone}
      actions={<OrganizationCreateButton />}
      filters={<OrganizationsFilter />}
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

    // select required fields
    filter.field = [
      'uuid',
      'name',
      'abbreviation',
      'email',
      'agreement_number',
      'created',
      'created_by_full_name',
      'created_by_username',
      'contact_details',
      'country',
      'address',
      'postal',
      'phone_number',
      'access_subnets',
      'accounting_start_date',
      'bank_account',
      'bank_name',
      'default_tax_percent',
      'registration_code',
      'vat_code',
      'domain',
      'is_service_provider',
      'organization_group_name',
      'organization_group_parent_name',
      'projects_count',
    ];

    return filter;
  },
);

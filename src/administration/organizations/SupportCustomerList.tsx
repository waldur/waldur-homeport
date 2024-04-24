import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import {
  SUPPORT_CUSTOMER_LIST,
  SUPPORT_CUSTOMERS_FORM_ID,
} from '@waldur/customer/list/constants';
import { OrganizationCreateButton } from '@waldur/customer/list/OrganizationCreateButton';
import { OrganizationEditButton } from '@waldur/customer/list/OrganizationEditButton';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { OrganizationHoverableRow } from '@waldur/user/affiliations/OrganizationHoverableRow';

import { OrganizationDetails } from '../../customer/list/OrganizationDetails';
import { OrganizationLink } from '../../customer/list/OrganizationLink';

import { OrganizationsFilter } from './OrganizationsFilter';

export const SupportCustomerList: FunctionComponent<{}> = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: SUPPORT_CUSTOMER_LIST,
    fetchData: createFetcher('customers'),
    queryField: 'query',
    filter,
    exportAll: true,
    exportFields: [
      translate('Organization'),
      translate('Abbreviation'),
      translate('Contact email'),
      translate('Contact phone'),
    ],
    exportRow: (row) => [
      row.name,
      row.abbreviation,
      row.email,
      row.phone_number,
    ],
    exportKeys: ['name', 'abbreviation', 'email', 'phone_number'],
  });
  const columns = [
    {
      title: translate('Name'),
      render: OrganizationLink,
      orderField: 'name',
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => renderFieldOrDash(row.abbreviation),
    },
    {
      title: translate('Contact email'),
      render: ({ row }) => renderFieldOrDash(row.email),
    },
    {
      title: translate('Contact phone'),
      render: ({ row }) => renderFieldOrDash(row.phone_number),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Organizations')}
      actions={<OrganizationCreateButton />}
      hasQuery={true}
      enableExport={true}
      showPageSizeSelector={true}
      hoverableRow={({ row }) => (
        <>
          <OrganizationHoverableRow row={row} />
          <OrganizationEditButton customer={row} />
        </>
      )}
      expandableRow={({ row }) => <OrganizationDetails customer={row} />}
      filters={<OrganizationsFilter />}
    />
  );
};

const mapStateToFilter = createSelector(
  getFormValues(SUPPORT_CUSTOMERS_FORM_ID),
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
    ];

    return filter;
  },
);

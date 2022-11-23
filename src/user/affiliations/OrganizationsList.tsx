import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { CustomerLink } from '@waldur/customer/CustomerLink';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';
import {
  getCustomer as getCustomerSelector,
  getUser,
} from '@waldur/workspace/selectors';

import { OrganizationExpandableRow } from './OrganizationExpandableRow';
import { OrganizationHoverableRow } from './OrganizationHoverableRow';
import { RoleField } from './RoleField';

export const TableComponent: FunctionComponent<any> = (props) => {
  const { filterColumns } = props;

  const columns = filterColumns([
    {
      title: translate('Organization'),
      render: CustomerLink,
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => <>{row.customer_abbreviation || DASH_ESCAPE_CODE}</>,
    },
    {
      title: translate('Role'),
      render: RoleField,
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.customer_email || DASH_ESCAPE_CODE}</>,
    },
    {
      title: translate('Division'),
      render: ({ row }) => (
        <>{row.customer_division_name || DASH_ESCAPE_CODE}</>
      ),
    },
    {
      title: translate('Projects'),
      render: ({ row }) => <>{row.customer_projects_count || 0}</>,
    },
    {
      title: translate('Created'),
      render: ({ row }) => (
        <>{renderFieldOrDash(formatDate(row.customer_created))}</>
      ),
    },
  ]);

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('organizations')}
      title={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      rowClass={({ row }) =>
        props.currentOrganization?.uuid === row.customer_uuid
          ? 'bg-gray-200'
          : ''
      }
      hoverableRow={OrganizationHoverableRow}
      expandableRow={OrganizationExpandableRow}
      fullWidth={true}
    />
  );
};

const TableOptions = {
  table: 'customerList',
  fetchData: createFetcher('customer-permissions'),
  queryField: 'customer_name',
  mapPropsToFilter: (props) => {
    const filter: Record<string, string[]> = {};
    // select required fields
    filter.field = [
      'customer_uuid',
      'customer_name',
      'customer_abbreviation',
      'role',
      'customer_email',
      'customer_division_name',
      'customer_projects_count',
      'created',
      'created_by_full_name',
      'created_by_username',
    ];
    filter.user = props.currentUser.uuid;
    return filter;
  },
  exportRow: (row) => [
    row.customer_name,
    row.customer_email || DASH_ESCAPE_CODE,
    row.customer_division_name || DASH_ESCAPE_CODE,
    row.projects_count || 0,
    formatDateTime(row.customer_created),
  ],
  exportFields: ['Name', 'Email', 'Division', 'Projects', 'Created'],
};

export const OrganizationsList = connect((state: RootState) => ({
  currentOrganization: getCustomerSelector(state),
  currentUser: getUser(state),
}))(connectTable(TableOptions)(TableComponent));

import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { TableOptionsType } from '@waldur/table/types';
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
      render: ({ row }) => (
        <Link
          state="organization.dashboard"
          params={{ uuid: row.uuid }}
          label={row.name}
        />
      ),
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => <>{row.abbreviation || DASH_ESCAPE_CODE}</>,
    },
    {
      title: translate('Role'),
      render: RoleField,
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.email || DASH_ESCAPE_CODE}</>,
    },
    {
      title: translate('Organization group'),
      render: ({ row }) => <>{row.division_name || DASH_ESCAPE_CODE}</>,
    },
    {
      title: translate('Projects'),
      render: ({ row }) => <>{row.projects_count || 0}</>,
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{renderFieldOrDash(formatDate(row.created))}</>,
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
        props.currentOrganization?.uuid === row.uuid ? 'bg-gray-200' : ''
      }
      hoverableRow={OrganizationHoverableRow}
      expandableRow={OrganizationExpandableRow}
      fullWidth={true}
    />
  );
};

export const getUserOrganizationsList = (
  extraOptions?: Partial<TableOptionsType>,
) => {
  const TableOptions = {
    table: 'customerList',
    fetchData: createFetcher('customers'),
    queryField: 'name',
    mapPropsToFilter: (props) => {
      const filter: Record<string, string[]> = {};
      // select required fields
      filter.field = [
        'uuid',
        'name',
        'abbreviation',
        'role',
        'email',
        'division_name',
        'projects_count',
        'created',
        'created_by_full_name',
        'created_by_username',
      ];
      filter.user = props.user.uuid;
      return filter;
    },
    exportRow: (row) => [
      row.name,
      row.email || DASH_ESCAPE_CODE,
      row.division_name || DASH_ESCAPE_CODE,
      row.projects_count || 0,
      formatDateTime(row.created),
    ],
    exportFields: [
      'Name',
      'Email',
      'Organization group',
      'Projects',
      'Created',
    ],
    ...extraOptions,
  };

  return connectTable(TableOptions)(TableComponent);
};

const PureOrganizations = getUserOrganizationsList();

export const OrganizationsList = connect((state: RootState) => ({
  currentOrganization: getCustomerSelector(state),
  user: getUser(state),
}))(PureOrganizations);

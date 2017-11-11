import React from 'react';

import { Table, connectTable, createFetcher } from '../../table-react';
import { filterByUser } from '@waldur/table-react/selectors';

import CustomerRole from './CustomerRole';
import CustomerLink from './CustomerLink';
import CustomerCreateButton from './CustomerCreateButton';
import CustomerExpertField from './CustomerExpertField';

const TableComponent = props => {
  const { translate } = props
  return <Table {...props} columns={[
    {
      title: translate('Organization name'),
      render: CustomerLink,
    },
    {
      title: translate('Owner'),
      render: CustomerRole,
      className: 'text-center col-md-1'
    },
    {
      title: translate('Expert'),
      render: CustomerExpertField,
      className: 'text-center col-md-1'
    }
  ]}
  verboseName={translate('organizations')}
  actions={<CustomerCreateButton/>}/>;
};

const TableOptions = {
  table: 'customers',
  fetchData: createFetcher('customer-permissions'),
  getDefaultFilter: filterByUser,
  exportFields: ['customer', 'role'],
  exportRow: row => [row.customer_name, row.role],
};

export default connectTable(TableOptions)(TableComponent);

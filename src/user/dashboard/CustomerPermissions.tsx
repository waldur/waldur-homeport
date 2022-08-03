import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { CustomerLink } from '@waldur/customer/CustomerLink';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { filterByUser } from '@waldur/workspace/selectors';

import CustomerCreateButton from './CustomerCreateButton';

const TableComponent: FunctionComponent<any> = (props) => {
  const { filterColumns } = props;
  return (
    <Table
      {...props}
      columns={filterColumns([
        {
          title: translate('Organization name'),
          render: CustomerLink,
        },
        {
          title: translate('Role'),
          render: ({ row }) => (
            <>
              {ENV.roles[row.role] ? translate(ENV.roles[row.role]) : row.role}
            </>
          ),
          className: 'text-center col-md-1',
        },
      ])}
      verboseName={translate('organizations')}
      actions={<CustomerCreateButton />}
    />
  );
};

const TableOptions = {
  table: 'customers',
  fetchData: createFetcher('customer-permissions'),
  getDefaultFilter: filterByUser,
  exportFields: ['customer', 'role'],
  exportRow: (row) => [row.customer_name, row.role],
};

export const CustomerPermissions = connectTable(TableOptions)(TableComponent);

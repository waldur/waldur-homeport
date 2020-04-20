import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { defaultCurrency } from '@waldur/core/services';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { TableOptionsType } from '@waldur/table-react/types';
import { getCustomer } from '@waldur/workspace/selectors';

import { InvoicesFilter } from './InvoicesFilter';
import { SendNotificationButton } from './SendNotificationButton';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Invoice number'),
          render: ({ row }) => (
            <Link state="billingDetails" params={{ uuid: row.uuid }}>
              {row.number}
            </Link>
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
        },
        {
          title: translate('Price'),
          render: ({ row }) => defaultCurrency(row.price),
        },
        {
          title: translate('Tax'),
          render: ({ row }) => defaultCurrency(row.tax),
        },
        {
          title: translate('Total'),
          render: ({ row }) => defaultCurrency(row.total),
        },
        {
          title: translate('Invoice date'),
          render: ({ row }) => row.invoice_date || 'N/A',
        },
        {
          title: translate('Due date'),
          render: ({ row }) => row.due_date || 'N/A',
        },
        {
          title: translate('Actions'),
          render: SendNotificationButton,
        },
      ]}
      verboseName={translate('invoices')}
    />
  );
};

const mapPropsToFilter = props => ({
  ...props.stateFilter,
  customer: props.customer.url,
});

const TableOptions: TableOptionsType = {
  table: 'invoices',
  fetchData: createFetcher('invoices'),
  mapPropsToFilter,
  queryField: 'number',
};

const mapsStateToProps = state => ({
  customer: getCustomer(state),
  stateFilter: getFormValues('InvoicesFilter')(state),
});

const enhance = compose(connect(mapsStateToProps), connectTable(TableOptions));

const InvoicesListComponent = enhance(TableComponent);

export const InvoicesList = () => (
  <>
    <InvoicesFilter />
    <InvoicesListComponent />
  </>
);

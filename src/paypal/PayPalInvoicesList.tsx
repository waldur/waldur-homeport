import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

import { InvoiceActions } from './InvoiceActions';
import { InvoicesFilter } from './InvoicesFilter';
import { InvoiceStateIndicator } from './InvoiceStateIndicator';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Invoice number'),
          render: ({ row }) => (
            <Link state="billingDetails" params={{ uuid: row.uuid }}>
              {row.number || 'N/A'}
            </Link>
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <InvoiceStateIndicator model={row} />,
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
          render: ({ row }) => row.start_date || 'N/A',
        },
        {
          title: translate('Due date'),
          render: ({ row }) => row.end_date || 'N/A',
        },
        {
          title: translate('Actions'),
          visible: props.showActions,
          render: ({ row }) => <InvoiceActions invoice={row} />,
        },
      ]}
      verboseName={translate('invoices')}
      hasQuery={false}
    />
  );
};

const mapPropsToFilter = (props) => ({
  ...props.stateFilter,
  customer: props.customer.url,
});

const TableOptions: TableOptionsType = {
  table: 'paypal-invoices',
  fetchData: createFetcher('paypal-invoices'),
  mapPropsToFilter,
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  showActions: isOwnerOrStaff(state),
  stateFilter: getFormValues('PayPalInvoicesFilter')(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

const InvoicesListComponent = enhance(TableComponent);

export const PayPalInvoicesList: FunctionComponent = () => (
  <>
    <InvoicesFilter />
    <InvoicesListComponent />
  </>
);

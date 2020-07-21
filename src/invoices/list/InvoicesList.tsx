import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { defaultCurrency } from '@waldur/core/services';
import { INVOICES_TABLE } from '@waldur/invoices/constants';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { MarkAsPaidButton } from '@waldur/invoices/list/MarkAsPaidButton';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { getCustomer } from '@waldur/workspace/selectors';

import { InvoicesFilter } from './InvoicesFilter';
import { SendNotificationButton } from './SendNotificationButton';

const TableComponent = (props) => {
  const { translate } = props;
  const columns = [
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
      title: translate('Invoice date'),
      render: ({ row }) => row.invoice_date || 'N/A',
    },
    {
      title: translate('Due date'),
      render: ({ row }) => row.due_date || 'N/A',
    },
  ];
  const activeFixedPriceProfile = getActiveFixedPricePaymentProfile(
    props.customer.payment_profiles,
  );
  if (!activeFixedPriceProfile) {
    columns.push(
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
        title: translate('Actions'),
        render: ({ row }) => (
          <>
            <SendNotificationButton row={row} />
            <MarkAsPaidButton row={row} />
          </>
        ),
      },
    );
  }
  return (
    <Table {...props} columns={columns} verboseName={translate('invoices')} />
  );
};

const mapPropsToFilter = (props) => ({
  ...props.stateFilter,
  customer: props.customer.url,
});

const TableOptions: TableOptionsType = {
  table: INVOICES_TABLE,
  fetchData: createFetcher('invoices'),
  mapPropsToFilter,
  queryField: 'number',
};

const mapsStateToProps = (state) => ({
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

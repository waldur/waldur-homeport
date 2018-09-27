import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { renderFieldOrDash } from '@waldur/table-react/utils';
import { getCustomer } from '@waldur/workspace/selectors';

export const TableComponent = props => {
  const columns = [
    {
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
    },
    {
      title: translate('Organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDate(row.created),
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => renderFieldOrDash(row.plan_name),
    },
    {
      title: translate('Cost'),
      render: ({ row }) => defaultCurrency(row.cost),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Order items')}
    />
  );
};

const TableOptions = {
  table: TABLE_NAME,
  fetchData: createFetcher('marketplace-order-items'),
  mapPropsToFilter: props => {
    const filter: any = {provider_uuid: props.customer.uuid};
    if (props.filter && props.filter.offering) {
      filter.offering_uuid = props.filter.offering.uuid;
    }
    return filter;
  },
};

const mapStateToProps = state => ({
  filter: getFormValues('OrderItemFilter')(state),
  customer: getCustomer(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
);

export const OrderItemsList = enhance(TableComponent);

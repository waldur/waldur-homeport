import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsLink } from '@waldur/marketplace/orders/OrderItemDetailsLink';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { renderFieldOrDash } from '@waldur/table-react/utils';
import { getCustomer } from '@waldur/workspace/selectors';

export const TableComponent = props => {
  const columns = [
    {
      title: translate('Offering'),
      render: ({row}) => (
        <OrderItemDetailsLink order_item_uuid={row.uuid}>
          {row.offering_name}
        </OrderItemDetailsLink>
      ),
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
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
  table: 'OrderItemList',
  fetchData: createFetcher('marketplace-order-items'),
  mapPropsToFilter: props => {
    const filter: any = {provider_uuid: props.customer.uuid};
    if (props.filter) {
      if (props.filter.offering) {
        filter.offering_uuid = props.filter.offering.uuid;
      }
      if (props.filter.organization) {
        filter.customer_uuid = props.filter.organization.uuid;
      }
      if (props.filter.state) {
        filter.state = props.filter.state.value;
      }
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

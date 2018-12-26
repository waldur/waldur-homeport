import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { connectTable, createFetcher } from '@waldur/table-react';
import { getCustomer } from '@waldur/workspace/selectors';

import { TableComponent } from './OrderItemsList';

const TableOptions = {
  table: 'MyOrderItemList',
  fetchData: createFetcher('marketplace-order-items'),
  mapPropsToFilter: props => {
    const filter: any = {customer_uuid: props.customer.uuid};
    if (props.filter) {
      if (props.filter.offering) {
        filter.offering_uuid = props.filter.offering.uuid;
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

export const MyOrderItemsList = enhance(TableComponent);

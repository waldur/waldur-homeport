import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { connectTable, createFetcher } from '@waldur/table-react';
import { getCustomer } from '@waldur/workspace/selectors';

import { TABLE_SUPPORT_ORDERS } from './constants';
import { TableComponent } from './OrderItemsList';

const TableOptions = {
  table: TABLE_SUPPORT_ORDERS,
  fetchData: createFetcher('marketplace-order-items'),
  mapPropsToFilter: props => {
    const filter: any = {};
    if (props.filter) {
      if (props.filter.offering) {
        filter.offering_uuid = props.filter.offering.uuid;
      }
      if (props.filter.organization) {
        filter.customer_uuid = props.filter.organization.uuid;
      }
      if (props.filter.provider) {
        filter.provider_uuid = props.filter.provider.customer_uuid;
      }
      if (props.filter.state) {
        filter.state = props.filter.state.value;
      }
      if (props.filter.type) {
        filter.type = props.filter.type.value;
      }
    }
    return filter;
  },
};

const mapStateToProps = state => ({
  filter: getFormValues('OrderItemFilter')(state),
  customer: getCustomer(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const SupportOrderItemsList = enhance(TableComponent);

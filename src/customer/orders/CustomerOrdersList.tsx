import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { MarketplaceOrdersListData } from 'waldur-js-client';

import { OrdersBulkActions } from '@waldur/marketplace/orders/actions/OrdersBulkActions';
import { CustomerOrdersListFilter } from '@waldur/marketplace/orders/list/MarketplaceOrdersListFilter';
import { OrdersTableComponent } from '@waldur/marketplace/orders/list/OrdersTableComponent';
import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';

import {
  CUSTOMER_ORDERS_LIST_FILTER_FORM_ID,
  TABLE_CUSTOMER_ORDERS,
} from '../constants';

export const CustomerOrdersList: FunctionComponent = () => {
  const filter = useSelector<RootState, MarketplaceOrdersListData['query']>(
    mapStateToFilter,
  );

  return (
    <OrdersTableComponent
      table={TABLE_CUSTOMER_ORDERS}
      filters={<CustomerOrdersListFilter />}
      filter={filter}
      hideColumns={['organization']}
      standalone
      enableMultiSelect
      multiSelectActions={OrdersBulkActions}
    />
  );
};

const mapStateToFilter = createSelector(
  getCustomer,
  getFormValues(CUSTOMER_ORDERS_LIST_FILTER_FORM_ID),
  (customer, filterValues: any) => {
    const filter: MarketplaceOrdersListData['query'] = {};
    if (customer) {
      filter.customer_uuid = customer.uuid;
    }
    if (filterValues) {
      if (filterValues.project) {
        filter.project_uuid = filterValues.project.uuid;
      }
      if (filterValues.state) {
        filter.state = filterValues.state.value;
      }
      if (filterValues.type) {
        filter.type = filterValues.type.value;
      }
      if (filterValues.offering) {
        filter.offering_uuid = filterValues.offering.uuid;
      }
    }
    return filter;
  },
);

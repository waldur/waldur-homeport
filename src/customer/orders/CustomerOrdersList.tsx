import { FunctionComponent, useEffect, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { MarketplaceOrdersListData } from 'waldur-js-client';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { OrdersBulkActions } from '@/marketplace/orders/actions/OrdersBulkActions';
import { OrdersListFilter } from '@/marketplace/orders/list/MarketplaceOrdersListFilter';
import { OrdersTableComponent } from '@/marketplace/orders/list/OrdersTableComponent';
import { useCustomer } from '@/workspace/hooks';

import {
  CUSTOMER_ORDERS_LIST_FILTER_FORM_ID,
  TABLE_CUSTOMER_ORDERS,
} from '../constants';

const CustomerOrdersListTable: FunctionComponent = () => {
  const customer = useCustomer();
  const { values } = useFormState();
  const filterValues: any = values;

  useEffect(() => {
    if (filterValues) {
      syncFiltersToURL(filterValues);
    }
  }, [filterValues]);

  const filter = useMemo(() => {
    const filterObj: MarketplaceOrdersListData['query'] = {};
    if (customer) {
      filterObj.customer_uuid = customer.uuid;
    }
    if (filterValues) {
      if (filterValues.project) {
        filterObj.project_uuid = filterValues.project.uuid;
      }
      if (filterValues.state) {
        filterObj.state = filterValues.state.value;
      }
      if (filterValues.type) {
        filterObj.type = filterValues.type.value;
      }
      if (filterValues.offering) {
        filterObj.offering_uuid = filterValues.offering.uuid;
      }
    }
    return filterObj;
  }, [customer, filterValues]);

  return (
    <OrdersTableComponent
      table={TABLE_CUSTOMER_ORDERS}
      formId={CUSTOMER_ORDERS_LIST_FILTER_FORM_ID}
      filters={<OrdersListFilter hasOffering />}
      filter={filter}
      hideColumns={['organization']}
      enableMultiSelect
      multiSelectActions={OrdersBulkActions}
    />
  );
};

export const CustomerOrdersList: FunctionComponent = () => {
  const initialValues = useMemo(() => getInitialValues(), []);
  return (
    <Form
      onSubmit={() => {}}
      subscription={{ values: true }}
      initialValues={initialValues}
    >
      {() => <CustomerOrdersListTable />}
    </Form>
  );
};

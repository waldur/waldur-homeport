import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { MarketplaceOrdersListData } from 'waldur-js-client';

import { getInitialValues } from '@/core/filters';
import {
  OFFERING_ORDERS_LIST_FILTER_FORM_ID,
  TABLE_OFFERING_ORDERS,
} from '@/marketplace/details/constants';
import { OrdersListFilter } from '@/marketplace/orders/list/MarketplaceOrdersListFilter';
import { OrdersTableComponent } from '@/marketplace/orders/list/OrdersTableComponent';
import { createOrderStateOptions } from '@/marketplace/orders/OrderStates';
import { Offering } from '@/marketplace/types';

interface OwnProps {
  offering: Offering;
}

const OfferingOrdersListTable: FunctionComponent<OwnProps> = (props) => {
  const { values } = useFormState();
  const filterValues: any = values;

  const formFilter = useMemo(() => {
    const filterObj: MarketplaceOrdersListData['query'] = {};
    if (filterValues) {
      if (filterValues.organization) {
        filterObj.customer_uuid = filterValues.organization.uuid;
      }
      if (filterValues.project) {
        filterObj.project_uuid = filterValues.project.uuid;
      }
      if (filterValues.state) {
        filterObj.state = filterValues.state.value;
      }
      if (filterValues.type) {
        filterObj.type = filterValues.type.value;
      }
      if (filterValues.provider) {
        filterObj.provider_uuid = filterValues.provider.customer_uuid;
      }
    }
    return filterObj;
  }, [filterValues]);

  const filter = useMemo(() => {
    if (!props.offering) return formFilter;
    return {
      ...formFilter,
      offering_uuid: props.offering.uuid,
    };
  }, [props.offering, formFilter]);

  return (
    <OrdersTableComponent
      table={TABLE_OFFERING_ORDERS}
      formId={OFFERING_ORDERS_LIST_FILTER_FORM_ID}
      filters={<OrdersListFilter hasOrganization />}
      filter={filter}
    />
  );
};

export const OfferingOrdersList: FunctionComponent<OwnProps> = (props) => {
  const initialValues = useMemo(() => {
    const stateOptions = createOrderStateOptions();
    return getInitialValues({
      state: stateOptions[0],
    });
  }, []);

  return (
    <Form
      onSubmit={() => {}}
      subscription={{ values: true }}
      initialValues={initialValues}
    >
      {() => <OfferingOrdersListTable {...props} />}
    </Form>
  );
};

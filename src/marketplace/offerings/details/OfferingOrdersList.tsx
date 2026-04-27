import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { MarketplaceOrdersListData } from 'waldur-js-client';

import {
  OFFERING_ORDERS_LIST_FILTER_FORM_ID,
  TABLE_OFFERING_ORDERS,
} from '@/marketplace/details/constants';
import { OfferingOrdersListFilter } from '@/marketplace/orders/list/MarketplaceOrdersListFilter';
import { OrdersTableComponent } from '@/marketplace/orders/list/OrdersTableComponent';
import { Offering } from '@/marketplace/types';

interface OwnProps {
  offering: Offering;
}

export const OfferingOrdersList: FunctionComponent<OwnProps> = (props) => {
  const formFilter = useSelector(mapStateToFilter);
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
      filters={<OfferingOrdersListFilter />}
      filter={filter}
    />
  );
};

const mapStateToFilter = createSelector(
  getFormValues(OFFERING_ORDERS_LIST_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: MarketplaceOrdersListData['query'] = {};
    if (filterValues) {
      if (filterValues.organization) {
        filter.customer_uuid = filterValues.organization.uuid;
      }
      if (filterValues.project) {
        filter.project_uuid = filterValues.project.uuid;
      }
      if (filterValues.state) {
        filter.state = filterValues.state.value;
      }
      if (filterValues.type) {
        filter.type = filterValues.type.value;
      }
      if (filterValues.provider) {
        filter.provider_uuid = filterValues.provider.customer_uuid;
      }
    }
    return filter;
  },
);

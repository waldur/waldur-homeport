import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import {
  MARKETPLACE_ORDERS_LIST_FILTER_FORM_ID,
  TABLE_MARKETPLACE_ORDERS,
} from '@waldur/marketplace/orders/list/constants';
import { useMarketplacePublicTabs } from '@waldur/marketplace/utils';

import { MarketplaceOrdersListFilter } from './MarketplaceOrdersListFilter';
import { OrdersTableComponent } from './OrdersTableComponent';

interface MarketplaceOrdersListProps {
  provider_uuid?: string;
}

const mapStateToFilter = createSelector(
  getFormValues(MARKETPLACE_ORDERS_LIST_FILTER_FORM_ID),
  (filterValues: any) => filterValues,
);

const useMarketplaceOrdersFilter = () => {
  const filterValues = useSelector(mapStateToFilter);
  return useMemo(() => {
    const filter: Record<string, string> = {};
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
      if (filterValues.offering) {
        filter.offering_uuid = filterValues.offering.uuid;
      }
      if (filterValues.provider) {
        filter.provider_uuid = filterValues.provider.customer_uuid;
      }
    }
    return filter;
  }, [filterValues]);
};

export const MarketplaceOrdersList: FunctionComponent<
  MarketplaceOrdersListProps
> = () => {
  const filter = useMarketplaceOrdersFilter();
  useMarketplacePublicTabs();

  return (
    <OrdersTableComponent
      table={TABLE_MARKETPLACE_ORDERS}
      filters={<MarketplaceOrdersListFilter />}
      filter={filter}
      standalone
    />
  );
};

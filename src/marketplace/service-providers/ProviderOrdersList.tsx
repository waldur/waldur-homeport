import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { ProviderOrdersListFilter } from '../orders/list/MarketplaceOrdersListFilter';
import { OrdersTableComponent } from '../orders/list/OrdersTableComponent';

import { PROVIDER_ORDERS_LIST_FILTER_FORM_ID } from './constants';

const mapStateToFilter = createSelector(
  getFormValues(PROVIDER_ORDERS_LIST_FILTER_FORM_ID),
  (filterValues: any) => filterValues,
);

const useProviderOrdersFilter = (provider_uuid?: string) => {
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
      if (filterValues.provider && !provider_uuid) {
        filter.provider_uuid = filterValues.provider.customer_uuid;
      }
    }
    if (provider_uuid) {
      filter.provider_uuid = provider_uuid;
    }
    return filter;
  }, [filterValues, provider_uuid]);
};

export const ProviderOrdersList = ({ provider }) => {
  const filter = useProviderOrdersFilter(provider.customer_uuid);
  return (
    <OrdersTableComponent
      table="ProviderOrdersList"
      filters={
        <ProviderOrdersListFilter provider_uuid={provider.customer_uuid} />
      }
      filter={filter}
    />
  );
};

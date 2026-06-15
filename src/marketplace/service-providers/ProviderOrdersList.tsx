import { useMemo } from 'react';
import { MarketplaceOrdersListData } from 'waldur-js-client';

import { useFilterValues } from '@/table/useFilterValues';

import { OrdersBulkActions } from '../orders/actions/OrdersBulkActions';
import { OrdersListFilter } from '../orders/list/MarketplaceOrdersListFilter';
import { OrdersTableComponent } from '../orders/list/OrdersTableComponent';

import { PROVIDER_ORDERS_LIST_FILTER_FORM_ID } from './constants';

export const ProviderOrdersList = ({ provider }) => {
  const provider_uuid = provider.customer_uuid;
  const filterValues = useFilterValues('ProviderOrdersList');

  const filter = useMemo(() => {
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
      if (filterValues.offering) {
        filterObj.offering_uuid = filterValues.offering.uuid;
      }
      if (filterValues.provider && !provider_uuid) {
        filterObj.provider_uuid = filterValues.provider.customer_uuid;
      }
    }
    if (provider_uuid) {
      filterObj.provider_uuid = provider_uuid;
    }
    return filterObj;
  }, [filterValues, provider_uuid]);

  return (
    <OrdersTableComponent
      table="ProviderOrdersList"
      formId={PROVIDER_ORDERS_LIST_FILTER_FORM_ID}
      filters={
        <OrdersListFilter
          provider_uuid={provider_uuid}
          hasOffering
          hasOrganization
        />
      }
      filter={filter}
      standalone
      enableMultiSelect
      multiSelectActions={OrdersBulkActions}
    />
  );
};

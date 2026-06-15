import { FunctionComponent, useMemo } from 'react';
import { MarketplaceOrdersListData } from 'waldur-js-client';

import {
  MARKETPLACE_ORDERS_LIST_FILTER_FORM_ID,
  TABLE_MARKETPLACE_ORDERS,
} from '@/marketplace/orders/list/constants';
import { useMarketplacePublicTabs } from '@/marketplace/utils';
import { useFilterValues } from '@/table/useFilterValues';

import { OrdersBulkActions } from '../actions/OrdersBulkActions';

import { OrdersListFilter } from './MarketplaceOrdersListFilter';
import { OrdersTableComponent } from './OrdersTableComponent';

interface MarketplaceOrdersListProps {
  provider_uuid?: string;
}

export const MarketplaceOrdersList: FunctionComponent<
  MarketplaceOrdersListProps
> = () => {
  const filterValues = useFilterValues(TABLE_MARKETPLACE_ORDERS);

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
      if (filterValues.provider) {
        filterObj.provider_uuid = filterValues.provider.customer_uuid;
      }
      if (filterValues.was_auto_approved) {
        filterObj.was_auto_approved =
          filterValues.was_auto_approved.value === 'true';
      }
    }
    return filterObj;
  }, [filterValues]);

  useMarketplacePublicTabs();

  return (
    <OrdersTableComponent
      table={TABLE_MARKETPLACE_ORDERS}
      formId={MARKETPLACE_ORDERS_LIST_FILTER_FORM_ID}
      filters={<OrdersListFilter hasOffering hasOrganization />}
      filter={filter}
      standalone
      enableMultiSelect
      multiSelectActions={OrdersBulkActions}
    />
  );
};

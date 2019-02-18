import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { OrderItemDetails } from '@waldur/marketplace/orders/OrderItemDetails';
import { connectAngularComponent } from '@waldur/store/connect';

import { getTabs } from '../details/OfferingTabs';

// tslint:disable-next-line: variable-name
async function loadData(order_item_uuid) {
  const orderItem = await api.getOrderItem(order_item_uuid);
  const offering = await api.getOffering(orderItem.offering_uuid);
  const category = await api.getCategory(offering.category_uuid);
  const sections = category.sections;
  const tabs = getTabs({offering, sections});
  return {
    orderItem,
    offering,
    tabs,
  };
}

const OrderItemDetailsContainer: React.SFC<{}> = () => (
  <Query loader={loadData} variables={$state.params.order_item_uuid}>
    {({ loading, data, error }) => {
      if (loading) {
        return <LoadingSpinner/>;
      }
      if (error) {
        return <h3>{translate('Unable to get order item.')}</h3>;
      }
      return (
        <>
          <OrderItemDetails
            orderItem={data.orderItem}
            offering={data.offering}
          />
          <OfferingTabsComponent tabs={data.tabs}/>
        </>
      );
    }}
  </Query>
);

export default connectAngularComponent(OrderItemDetailsContainer);

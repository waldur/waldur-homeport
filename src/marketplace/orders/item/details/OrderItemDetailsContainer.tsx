import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { $state, ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { OrderItemDetailsType } from '@waldur/marketplace/orders/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { OrderItemDetails } from './OrderItemDetails';

function updateBreadcrumbs(orderItem: OrderItemDetailsType) {
  const $timeout = ngInjector.get('$timeout');
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  const WorkspaceService = ngInjector.get('WorkspaceService');
  const titleService = ngInjector.get('titleService');

  $timeout(() => {
    titleService.setTitle(orderItem.offering_name);
    BreadcrumbsService.activeItem = orderItem.attributes.name;
    const data = WorkspaceService.getWorkspace();
    if (data.workspace === 'organization') {
      BreadcrumbsService.items = [
        {
          label: translate('Organization workspace'),
          state: 'organization.details',
        },
        {
          label: translate('My services'),
        },
        {
          label: translate('My orders'),
          state: 'marketplace-my-order-items',
          params: {
            uuid: orderItem.customer_uuid,
          },
        },
        {
          label: translate('Order details'),
          state: 'marketplace-order-details-customer',
          params: {
            order_uuid: orderItem.order_uuid,
          },
        },
      ];
    } else {
      BreadcrumbsService.items = [
        {
          label: translate('Project workspace'),
          state: 'project.details',
        },
        {
          label: translate('My orders'),
          state: 'marketplace-order-list',
        },
        {
          label: translate('Order details'),
          state: 'marketplace-order-details',
          params: {
            order_uuid: orderItem.order_uuid,
          },
        },
      ];
    }
  });
}

// tslint:disable-next-line: variable-name
async function loadData(order_item_uuid) {
  const orderItem = await api.getOrderItem(order_item_uuid);
  updateBreadcrumbs(orderItem);
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

import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { OrderItemDetailsType } from '@waldur/marketplace/orders/types';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';
import store from '@waldur/store/store';
import { getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { OrderItemDetails } from './OrderItemDetails';

function getBreadcrumbs(orderItem: OrderItemDetailsType): BreadcrumbItem[] {
  const workspace = getWorkspace(store.getState());
  if (workspace === ORGANIZATION_WORKSPACE) {
    return [
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
    return [
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
}

async function loadOrderItem(order_item_uuid) {
  const orderItem = await api.getOrderItem(order_item_uuid);
  const offering = await api.getOffering(orderItem.offering_uuid);
  const plugins = await api.getPlugins();
  const limits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  const category = await api.getCategory(offering.category_uuid);
  const sections = category.sections;
  const tabs = getTabs({ offering, sections });
  return {
    orderItem,
    offering,
    tabs,
    limits,
  };
}

export const OrderItemDetailsContainer: React.FC<{}> = () => {
  const {
    params: { order_item_uuid },
  } = useCurrentStateAndParams();

  const [{ loading, value, error }, loadData] = useAsyncFn(
    () => loadOrderItem(order_item_uuid),
    [order_item_uuid],
  );

  useBreadcrumbsFn(() => (value ? getBreadcrumbs(value.orderItem) : []), [
    value,
  ]);

  useTitle(
    value ? value.orderItem.offering_name : translate('Order item details'),
  );

  useEffectOnce(() => {
    loadData();
  });

  // Don't render loading indicator if order item is refreshing
  // since if it is in pending state it is refreshed via periodic polling
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <h3>{translate('Unable to get order item.')}</h3>;
  }
  if (!value) {
    return null;
  }
  return (
    <>
      <OrderItemDetails
        orderItem={value.orderItem}
        offering={value.offering}
        limits={value.limits}
        loadData={loadData}
      />
      <OfferingTabsComponent tabs={value.tabs} />
    </>
  );
};

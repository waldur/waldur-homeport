import { useCurrentStateAndParams } from '@uirouter/react';
import React, { useEffect, useState } from 'react';
import { useAsyncFn, useEffectOnce, useNetwork } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Await } from '@waldur/core/types';
import { useRecursiveTimeout } from '@waldur/core/useRecursiveTimeout';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { useTitle } from '@waldur/navigation/title';

import { OrderItemDetails } from './OrderItemDetails';

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

export const OrderItemDetailsContainer: React.FC = () => {
  const {
    params: { order_item_uuid },
  } = useCurrentStateAndParams();

  const [{ loading, value, error }, loadData] = useAsyncFn(
    () => loadOrderItem(order_item_uuid),
    [order_item_uuid],
  );

  useEffectOnce(() => {
    loadData();
  });

  const [asyncValue, setAsyncValue] =
    useState<Await<ReturnType<typeof loadData>>>();

  const { online } = useNetwork();

  // Refresh order item details until it is switched from pending state to terminal state
  const pullInterval =
    online && ['pending', 'executing'].includes(asyncValue?.orderItem.state)
      ? ENV.defaultPullInterval * 1000
      : null;
  useRecursiveTimeout(loadData, pullInterval);

  useEffect(() => {
    if (
      value &&
      (!asyncValue ||
        asyncValue.orderItem.modified !== value.orderItem.modified)
    ) {
      setAsyncValue(value);
    }
  }, [value, asyncValue]);

  useTitle(
    asyncValue
      ? asyncValue.orderItem.offering_name
      : translate('Order item details'),
  );

  // Don't render loading indicator if order item is refreshing
  // since if it is in pending state it is refreshed via periodic polling
  if (asyncValue) {
    return (
      <>
        <OrderItemDetails {...asyncValue} loadData={loadData} />
        <OfferingTabsComponent tabs={asyncValue.tabs} />
      </>
    );
  }
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <h3>{translate('Unable to get order item.')}</h3>;
  }
  return null;
};

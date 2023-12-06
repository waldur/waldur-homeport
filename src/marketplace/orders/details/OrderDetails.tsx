import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { useTitle } from '@waldur/navigation/title';

import { OrderRefreshButton } from '../actions/OrderRefreshButton';

import { OrderAccordion } from './OrderAccordion';

async function loadOrder(order_uuid) {
  const order = await api.getOrder(order_uuid);
  const offering = await api.getPublicOffering(order.offering_uuid);
  const plugins = await api.getPlugins();
  const limits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  const category = await api.getCategory(offering.category_uuid);
  const sections = category.sections;
  const tabs = getTabs({ offering, sections });
  return {
    order,
    offering,
    tabs,
    limits,
  };
}

export const OrderDetails: React.FC<{}> = () => {
  useTitle(translate('Order details'));
  const {
    params: { order_uuid },
  } = useCurrentStateAndParams();

  const { isLoading, error, data, refetch } = useQuery(
    ['OrderDetails', order_uuid],
    () => loadOrder(order_uuid),
    {
      refetchInterval: ENV.defaultPullInterval * 1000,
    },
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <h3 className="text-center">
        {translate('Unable to load order details.')}
      </h3>
    );
  }

  if (data) {
    return (
      <>
        <OrderRefreshButton loadData={refetch} />
        <OrderAccordion {...data} loadData={refetch} />
        <OfferingTabsComponent tabs={data.tabs} />
      </>
    );
  }
  return null;
};

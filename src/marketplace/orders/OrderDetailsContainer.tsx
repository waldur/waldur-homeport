import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';

import { OrderDetails } from './details/OrderDetails';

async function loadOrder(order_uuid) {
  const order = await api.getOrder(order_uuid);
  const offering = await api.getPublicOffering(order.offering_uuid);
  const plugins = await api.getPlugins();
  const limits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  return {
    order,
    offering,
    limits,
  };
}

export const OrderDetailsContainer: React.FC<{}> = () => {
  const {
    params: { order_uuid },
  } = useCurrentStateAndParams();
  const { isLoading, error, data, refetch, isRefetching } = useQuery(
    ['OrderDetails', order_uuid],
    () => loadOrder(order_uuid),
  );
  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3 className="text-center">
      {translate('Unable to load order details.')}
    </h3>
  ) : data ? (
    <OrderDetails
      data={data}
      refetch={refetch}
      order={data.order}
      offering={data.offering}
      isRefetching={isRefetching}
    />
  ) : null;
};

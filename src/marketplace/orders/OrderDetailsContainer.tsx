import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import {
  marketplaceOrdersRetrieve,
  marketplacePluginsList,
  marketplacePublicOfferingsRetrieve,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { Offering } from '../types';

import { OrderDetails } from './details/OrderDetails';

async function loadOrder(order_uuid: string) {
  const order = await marketplaceOrdersRetrieve({
    path: { uuid: order_uuid },
  }).then((response) => response.data);

  const offering = (await marketplacePublicOfferingsRetrieve({
    path: { uuid: order.offering_uuid },
  }).then((response) => response.data)) as Offering;

  const plugins = await marketplacePluginsList().then(
    (response) => response.data,
  );

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
  const { isLoading, error, data, refetch, isRefetching } = useQuery({
    queryKey: ['OrderDetails', order_uuid],
    queryFn: () => loadOrder(order_uuid),
  });
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

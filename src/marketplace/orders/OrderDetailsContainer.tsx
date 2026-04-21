import { CheckCircleIcon, EnvelopeIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import {
  marketplaceOrdersOfferingRetrieve,
  marketplaceOrdersResourceRetrieve,
  marketplaceOrdersRetrieve,
  marketplacePluginsList,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useExtraAnnouncementBar } from '@waldur/navigation/context';
import { AnnouncementBar } from '@waldur/navigation/header/announcements/AnnouncementBar';

import { Offering } from '../types';

import { OrderDetails } from './details/OrderDetails';

async function loadOrder(order_uuid: string) {
  const order = await marketplaceOrdersRetrieve({
    path: { uuid: order_uuid },
  }).then((response) => response.data);

  const resource = await marketplaceOrdersResourceRetrieve({
    path: { uuid: order_uuid },
  }).then((response) => response.data);

  const offering = (await marketplaceOrdersOfferingRetrieve({
    path: { uuid: order.uuid },
  }).then((response) => response.data)) as Offering;

  const plugins = await marketplacePluginsList().then(
    (response) => response.data,
  );

  const pluginLimits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  const limits = (offering as any).effective_available_limits || pluginLimits;
  return {
    order,
    offering,
    limits,
    resource,
  };
}

export const OrderDetailsContainer: React.FC<{}> = () => {
  const router = useRouter();
  const {
    params: { order_uuid },
  } = useCurrentStateAndParams();
  const { isLoading, error, data, refetch, isRefetching } = useQuery({
    queryKey: ['OrderDetails', order_uuid],
    queryFn: () => loadOrder(order_uuid),
  });

  const messagingBar = useMemo(() => {
    const order = data?.order;
    if (order?.state !== 'pending-provider' || !order?.provider_message)
      return null;

    const goToProviderInfo = () =>
      router.stateService.go('marketplace-orders.details', {
        order_uuid,
        tab: 'provider-info',
      });
    const plainMessage = order.provider_message.replace(/<[^>]*>/g, '');
    const description = order.provider_message_url
      ? `${plainMessage} — ${order.provider_message_url}`
      : plainMessage;
    const hasCustomerResponse =
      order.consumer_message || order.consumer_message_attachment;
    return hasCustomerResponse ? (
      <AnnouncementBar
        icon={CheckCircleIcon}
        variant="success"
        label={translate('Customer responded')}
        description={description}
        actionLabel={translate('Read more')}
        onAction={goToProviderInfo}
        colored
      />
    ) : (
      <AnnouncementBar
        icon={EnvelopeIcon}
        variant="warning"
        label={translate('Information requested')}
        description={description}
        actionLabel={translate('Read more')}
        onAction={goToProviderInfo}
        colored
      />
    );
  }, [data?.order, order_uuid, router]);

  useExtraAnnouncementBar(messagingBar, [messagingBar]);

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3 className="text-center">
      {translate('Unable to load order details.')}
    </h3>
  ) : data ? (
    <OrderDetails
      refetch={refetch}
      order={data.order}
      offering={data.offering}
      limits={data.limits}
      resource={data.resource}
      isRefetching={isRefetching}
    />
  ) : null;
};

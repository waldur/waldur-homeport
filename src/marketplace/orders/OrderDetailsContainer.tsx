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

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useExtraAnnouncementBar } from '@/navigation/context';
import { AnnouncementBar } from '@/navigation/header/announcements/AnnouncementBar';

import { OrderDetails } from './details/OrderDetails';
import { hasFreshConsumerResponse } from './utils';

async function loadOrder(order_uuid: string) {
  // All four requests key off the order UUID from the route, so none of them
  // depends on another's response — issue them together rather than in series.
  const [order, resource, offering, plugins] = await Promise.all([
    marketplaceOrdersRetrieve({ path: { uuid: order_uuid } }).then(
      (response) => response.data,
    ),
    marketplaceOrdersResourceRetrieve({ path: { uuid: order_uuid } }).then(
      (response) => response.data,
    ),
    marketplaceOrdersOfferingRetrieve({ path: { uuid: order_uuid } }).then(
      (response) => response.data,
    ),
    marketplacePluginsList().then((response) => response.data),
  ]);

  const pluginLimits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  const limits = offering.effective_available_limits || pluginLimits;
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
    const providerDescription = order.provider_message_url
      ? `${plainMessage} — ${order.provider_message_url}`
      : plainMessage;
    return hasFreshConsumerResponse(order) ? (
      <AnnouncementBar
        icon={CheckCircleIcon}
        variant="success"
        label={translate('Customer responded')}
        hasColon
        description={
          (order.consumer_message || '').replace(/<[^>]*>/g, '') ||
          providerDescription
        }
        actionLabel={translate('View response')}
        onAction={goToProviderInfo}
        colored
      />
    ) : (
      <AnnouncementBar
        icon={EnvelopeIcon}
        variant="warning"
        label={translate('Information requested')}
        hasColon
        description={providerDescription}
        actionLabel={translate('View and respond')}
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

import React from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';

import { PendingConsumerOrders } from './PendingConsumerOrders';
import { PendingProjectUpdates } from './PendingProjectUpdates';
import { PendingProviderOrders } from './PendingProviderOrders';

interface OwnProps {
  pendingOrdersCount: number;
  pendingProvidersCount: number;
  pendingProjectUpdatesCount: number;
}

const EmptyPendingItemsPlaceholder = () => {
  return (
    <h6 className="text-tertiary">{translate('No pending confirmations')}</h6>
  );
};

export const PendingConfirmationContainer: React.FC<OwnProps> = (props) => {
  const showConsumerOrders = !isFeatureVisible(
    MarketplaceFeatures.conceal_pending_consumer_orders,
  );
  const showProviderOrders = !isFeatureVisible(
    MarketplaceFeatures.conceal_pending_provider_orders,
  );
  const hasPendingItem = Boolean(
    (showConsumerOrders && props.pendingOrdersCount) ||
    (showProviderOrders && props.pendingProvidersCount) ||
    props.pendingProjectUpdatesCount,
  );
  if (!hasPendingItem) {
    return <EmptyPendingItemsPlaceholder />;
  }
  return (
    <div>
      {showConsumerOrders && props.pendingOrdersCount > 0 && (
        <div className="mb-4">
          <PendingConsumerOrders />
        </div>
      )}
      {showProviderOrders && props.pendingProvidersCount > 0 && (
        <div className="border-b-[1px] border-b-secondary pb-4 mb-4">
          <PendingProviderOrders />
        </div>
      )}
      {props.pendingProjectUpdatesCount > 0 && (
        <div className="mb-4">
          <h4 className="mb-2.5">{translate('Project update requests')}</h4>
          <PendingProjectUpdates />
        </div>
      )}
    </div>
  );
};

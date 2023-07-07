import React from 'react';

import { translate } from '@waldur/i18n';

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
    <h6 className="text-gray-600">{translate('No pending confirmations')}</h6>
  );
};

export const PendingConfirmationContainer: React.FC<OwnProps> = (props) => {
  const hasPendingItem = Boolean(
    props.pendingOrdersCount ||
      props.pendingProvidersCount ||
      props.pendingProjectUpdatesCount,
  );
  if (!hasPendingItem) {
    return <EmptyPendingItemsPlaceholder />;
  }
  return (
    <div>
      {props.pendingOrdersCount > 0 && (
        <div className="border-bottom pb-5 mb-5">
          <h4 className="mb-3">{translate('Pending consumer orders')}</h4>
          <PendingConsumerOrders />
        </div>
      )}
      {props.pendingProvidersCount > 0 && (
        <div className="border-bottom pb-5 mb-5">
          <h4 className="mb-3">{translate('Pending provider orders')}</h4>
          <PendingProviderOrders />
        </div>
      )}
      {props.pendingProjectUpdatesCount > 0 && (
        <div className="mb-5">
          <h4 className="mb-3">{translate('Project update requests')}</h4>
          <PendingProjectUpdates />
        </div>
      )}
    </div>
  );
};

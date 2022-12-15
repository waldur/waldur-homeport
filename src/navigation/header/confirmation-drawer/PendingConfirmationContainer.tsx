import React from 'react';

import { translate } from '@waldur/i18n';

import { PendingOrderConfirmation } from './PendingOrderConfirmation';
import { PendingProjectUpdates } from './PendingProjectUpdates';
import { PendingProviderConfirmation } from './PendingProviderConfirmation';

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
          <h4 className="mb-3">{translate('Pending order confirmation')}</h4>
          <PendingOrderConfirmation />
        </div>
      )}
      {props.pendingProvidersCount > 0 && (
        <div className="border-bottom pb-5 mb-5">
          <h4 className="mb-3">{translate('Pending provider confirmation')}</h4>
          <PendingProviderConfirmation />
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

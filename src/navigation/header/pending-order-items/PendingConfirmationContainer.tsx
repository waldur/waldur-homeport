import React from 'react';

import { translate } from '@waldur/i18n';

import { PendingOrderConfirmation } from './PendingOrderConfirmation';
import { PendingProviderConfirmation } from './PendingProviderConfirmation';

interface OwnProps {
  pendingOrdersCount: number;
  pendingProvidersCount: number;
}

const EmptyPendingOrderItemsPlaceholder = () => {
  return (
    <h6 className="text-gray-600">{translate('No active confirmations')}</h6>
  );
};

export const PendingConfirmationContainer: React.FC<OwnProps> = (props) => (
  <div>
    <div className="border-bottom pb-5 mb-5">
      <h4 className="mb-3">{translate('Pending order confirmation')}</h4>
      {props.pendingOrdersCount > 0 ? (
        <PendingOrderConfirmation />
      ) : (
        <EmptyPendingOrderItemsPlaceholder />
      )}
    </div>
    <div className="mb-5">
      <h4 className="mb-3">{translate('Pending provider confirmation')}</h4>
      {props.pendingProvidersCount > 0 ? (
        <PendingProviderConfirmation />
      ) : (
        <EmptyPendingOrderItemsPlaceholder />
      )}
    </div>
  </div>
);

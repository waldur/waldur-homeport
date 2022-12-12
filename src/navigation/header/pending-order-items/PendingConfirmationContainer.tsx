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
    <h6 className="text-gray-600">{translate('No pending confirmations')}</h6>
  );
};

export const PendingConfirmationContainer: React.FC<OwnProps> = (props) => {
  if (props.pendingOrdersCount === 0 && props.pendingProvidersCount === 0) {
    return <EmptyPendingOrderItemsPlaceholder />;
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
        <div className="mb-5">
          <h4 className="mb-3">{translate('Pending provider confirmation')}</h4>
          <PendingProviderConfirmation />
        </div>
      )}
    </div>
  );
};

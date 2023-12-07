import { OrderResponse } from '@waldur/marketplace/orders/types';

import { ApproveAllButton } from './ApproveAllButton';
import { RejectAllButton } from './RejectAllButton';

interface OwnProps {
  orders: OrderResponse[];
}

export const BulkProviderActions = ({ orders }: OwnProps) => {
  const hasActions = orders && orders.length;

  if (hasActions) {
    return (
      <>
        <ApproveAllButton orders={orders} />
        <RejectAllButton orders={orders} />
      </>
    );
  }
  return null;
};

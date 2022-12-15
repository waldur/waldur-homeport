import { OrderItemResponse } from '@waldur/marketplace/orders/types';

import { ApproveAllButton } from './ApproveAllButton';
import { RejectAllButton } from './RejectAllButton';

interface OwnProps {
  orders: OrderItemResponse[];
}

export const BulkActionButtons = ({ orders }: OwnProps) => {
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

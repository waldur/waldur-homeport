import { OrderItemApproveButton } from '@waldur/marketplace/orders/item/list/OrderItemApproveButton';
import { OrderItemRejectButton } from '@waldur/marketplace/orders/item/list/OrderItemRejectButton';

export const OrderItemActionsCell = ({ row }) => {
  return (
    <>
      <OrderItemApproveButton uuid={row.uuid} />
      <OrderItemRejectButton uuid={row.uuid} />
    </>
  );
};

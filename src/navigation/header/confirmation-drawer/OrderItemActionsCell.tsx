import { OrderItemApproveButton } from '@waldur/marketplace/orders/item/list/OrderItemApproveButton';
import { OrderItemRejectButton } from '@waldur/marketplace/orders/item/list/OrderItemRejectButton';

export const OrderItemActionsCell = ({ row, refetch }) => {
  return (
    <>
      <OrderItemApproveButton uuid={row.uuid} refetch={refetch} />
      <OrderItemRejectButton uuid={row.uuid} refetch={refetch} />
    </>
  );
};

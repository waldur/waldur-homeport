import { OrderItemApproveButton } from './OrderItemApproveButton';
import { OrderItemRejectButton } from './OrderItemRejectButton';

export const OrderItemActionsCell = ({ row }) => {
  if (
    (row.state === 'pending' &&
      row.offering_type === 'Waldur.RemoteOffering') ||
    (row.state === 'executing' && row.offering_type === 'Marketplace.Basic')
  ) {
    return (
      <>
        <OrderItemApproveButton uuid={row.uuid} />
        <OrderItemRejectButton uuid={row.uuid} />
      </>
    );
  }
  return 'N/A';
};

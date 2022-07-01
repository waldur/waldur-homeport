import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { SLURM_REMOTE_PLUGIN } from '@waldur/slurm/constants';

import { OrderItemApproveButton } from './OrderItemApproveButton';
import { OrderItemRejectButton } from './OrderItemRejectButton';

export const OrderItemActionsCell = ({ row }) => {
  if (
    (row.state === 'pending' &&
      (row.offering_type === REMOTE_OFFERING_TYPE ||
        row.offering_type === SLURM_REMOTE_PLUGIN)) ||
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

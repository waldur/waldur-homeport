import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { SLURM_REMOTE_PLUGIN } from '@waldur/slurm/constants';

import { ApproveByProviderButton } from './ApproveByProviderButton';
import { RejectByProviderButton } from './RejectByProviderButton';

export const OrderProviderActions = ({ row, refetch }) => {
  if (
    row.state === 'pending' &&
    (row.offering_type === REMOTE_OFFERING_TYPE ||
      row.offering_type === SLURM_REMOTE_PLUGIN)
  ) {
    return (
      <>
        <ApproveByProviderButton orderUuid={row.uuid} refetch={refetch} />
        <RejectByProviderButton orderUuid={row.uuid} refetch={refetch} />
      </>
    );
  }
  return <>N/A</>;
};

import { useSelector } from 'react-redux';

import { ApproveButton } from './ApproveButton';
import { RejectButton } from './RejectButton';
import { orderCanBeApproved as orderCanBeApprovedSelector } from './selectors';

export const OrderActions = ({
  orderId,
  refetch,
}: {
  orderId: string;
  refetch?;
}) => {
  const orderCanBeApproved = useSelector(orderCanBeApprovedSelector);
  if (!orderCanBeApproved) {
    return null;
  }
  return (
    <>
      <ApproveButton orderId={orderId} refetch={refetch} />
      <RejectButton orderId={orderId} refetch={refetch} />
    </>
  );
};

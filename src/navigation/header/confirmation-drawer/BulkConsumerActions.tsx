import { ConsumerApproveAll } from './ConsumerApproveAll';
import { ConsumerRejectAll } from './ConsumerRejectAll';

export const BulkConsumerActions = ({ orders, refetch }) => {
  const hasActions = orders && orders.length;

  if (hasActions) {
    return (
      <>
        <ConsumerApproveAll orders={orders} refetch={refetch} />
        <ConsumerRejectAll orders={orders} refetch={refetch} />
      </>
    );
  }
  return null;
};

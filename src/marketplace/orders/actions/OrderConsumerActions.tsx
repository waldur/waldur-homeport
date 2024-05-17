import { FC } from 'react';

import { ApproveByConsumerButton } from './ApproveByConsumerButton';
import { RejectByConsumerButton } from './RejectByConsumerButton';
import { OrderActionProps } from './types';

export const OrderConsumerActions: FC<OrderActionProps> = (props) =>
  props.order.state === 'pending-consumer' ? (
    <>
      <ApproveByConsumerButton {...props} />
      <RejectByConsumerButton {...props} />
    </>
  ) : (
    <>N/A</>
  );

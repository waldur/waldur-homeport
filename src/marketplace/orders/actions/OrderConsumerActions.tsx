import { FC } from 'react';

import { ApproveByConsumerButton } from './ApproveByConsumerButton';
import { RejectByConsumerButton } from './RejectByConsumerButton';
import { OrderActionProps } from './types';

export const OrderConsumerActions: FC<OrderActionProps> = (props) => (
  <>
    <ApproveByConsumerButton {...props} />
    <RejectByConsumerButton {...props} />
  </>
);

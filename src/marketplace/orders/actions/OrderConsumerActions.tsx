import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { ApproveByConsumerButton } from './ApproveByConsumerButton';
import { RejectByConsumerButton } from './RejectByConsumerButton';
import { OrderActionProps } from './types';

export const OrderConsumerActions: FC<OrderActionProps> = (props) =>
  props.order.state === 'pending-consumer' ? (
    <>
      <ApproveByConsumerButton
        {...props}
        className={props.as === Button ? 'btn-success btn-sm' : 'text-success'}
      />

      <RejectByConsumerButton
        {...props}
        className={props.as === Button ? 'btn-danger btn-sm flex-grow-1' : 'text-danger flex-grow-1'}
      />
    </>
  ) : null;

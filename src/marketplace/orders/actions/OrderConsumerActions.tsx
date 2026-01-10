import { FC } from 'react';

import { ActionButton } from '@waldur/table/ActionButton';

import { ApproveByConsumerButton } from './ApproveByConsumerButton';
import { RejectByConsumerButton } from './RejectByConsumerButton';
import { OrderActionProps } from './types';

export const OrderConsumerActions: FC<OrderActionProps> = (props) =>
  props.order.state === 'pending-consumer' ? (
    <>
      <ApproveByConsumerButton
        {...props}
        className={
          props.as === ActionButton ? 'btn-success btn-sm' : 'text-success'
        }
      />

      <RejectByConsumerButton
        {...props}
        className={
          props.as === ActionButton
            ? 'btn-danger btn-sm flex-grow-1'
            : 'text-danger flex-grow-1'
        }
      />
    </>
  ) : null;

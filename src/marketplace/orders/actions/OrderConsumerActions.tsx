import classNames from 'classnames';
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
        className={classNames(
          props.as === ActionButton
            ? { 'btn-primary': true, 'btn-sm': props.size === 'sm' }
            : 'text-success',
        )}
      />

      <RejectByConsumerButton
        {...props}
        className={classNames(
          props.as === ActionButton
            ? { 'btn-danger': true, 'btn-sm': props.size === 'sm' }
            : 'text-danger',
        )}
      />
    </>
  ) : null;

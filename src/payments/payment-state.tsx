import * as React from 'react';

import { StateIndicator, StateVariant } from '@waldur/core/StateIndicator';
import { connectAngularComponent } from '@waldur/store/connect';

export type PaymentStateType = 'Erred' | 'Approved' | 'Created' | 'Cancelled';

const LABEL_CLASSES: {[key in PaymentStateType]: StateVariant} = {
  Erred: 'warning',
  Approved: 'primary',
  Created: 'primary',
  Cancelled: 'plain',
};

interface PaymentStateIndicatorProps {
  payment: {
    state: PaymentStateType;
  };
}

export const PaymentStateIndicator = (props: PaymentStateIndicatorProps) => (
  <StateIndicator
    label={props.payment.state}
    variant={LABEL_CLASSES[props.payment.state] || 'info'}
    active={props.payment.state === 'Created'}
  />
);

export default connectAngularComponent(PaymentStateIndicator, ['payment']);

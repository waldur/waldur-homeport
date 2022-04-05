import { FunctionComponent } from 'react';
import { Variant } from 'react-bootstrap/types';

import { StateIndicator } from '@waldur/core/StateIndicator';

export type PaymentStateType = 'Erred' | 'Approved' | 'Created' | 'Cancelled';

const LABEL_CLASSES: { [key in PaymentStateType]: Variant } = {
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

export const PaymentStateIndicator: FunctionComponent<PaymentStateIndicatorProps> =
  (props) => (
    <StateIndicator
      label={props.payment.state}
      variant={LABEL_CLASSES[props.payment.state] || 'info'}
      active={props.payment.state === 'Created'}
    />
  );

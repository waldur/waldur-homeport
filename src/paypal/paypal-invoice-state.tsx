import * as React from 'react';

import { StateIndicator, StateVariant } from '@waldur/core/StateIndicator';
import { connectAngularComponent } from '@waldur/store/connect';

export type InvoiceStateType = 'DRAFT' | 'SENT' | 'CANCELLED' | 'PAID';

const LABEL_CLASSES: {[key in InvoiceStateType]: StateVariant} = {
  DRAFT: 'warning',
  SENT: 'primary',
  CANCELLED: 'danger',
  PAID: 'success',
};

interface InvoiceStateIndicatorProps {
  model: {
    state: InvoiceStateType;
  };
}

export const InvoiceStateIndicator = (props: InvoiceStateIndicatorProps) => (
  <StateIndicator
    label={props.model.state}
    variant={LABEL_CLASSES[props.model.state] || 'info'}
  />
);

export default connectAngularComponent(InvoiceStateIndicator, ['model']);

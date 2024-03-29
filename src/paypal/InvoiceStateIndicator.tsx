import { FunctionComponent } from 'react';
import { Variant } from 'react-bootstrap/types';

import { StateIndicator } from '@waldur/core/StateIndicator';

export type InvoiceStateType = 'DRAFT' | 'SENT' | 'CANCELLED' | 'PAID';

const LABEL_CLASSES: { [key in InvoiceStateType]: Variant } = {
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

export const InvoiceStateIndicator: FunctionComponent<InvoiceStateIndicatorProps> =
  (props) => (
    <StateIndicator
      label={props.model.state}
      variant={LABEL_CLASSES[props.model.state] || 'info'}
    />
  );

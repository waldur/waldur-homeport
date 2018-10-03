import * as React from 'react';

import { OrderState } from '@waldur/marketplace/cart/types';
import { StepsList } from '@waldur/marketplace/common/StepsList';

interface OrderStepsProps {
  state: OrderState;
}

const STEPS = [
  'Configure',
  'Approve',
  'Review',
];

export const OrderSteps = (props: OrderStepsProps) => (
  <StepsList choices={STEPS} value={props.state}/>
);

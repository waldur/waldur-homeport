import * as React from 'react';

import { StepsList } from '@waldur/marketplace/common/StepsList';

import { OrderState } from './types';

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

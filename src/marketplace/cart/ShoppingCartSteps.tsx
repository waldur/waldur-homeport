import * as React from 'react';

import { StepsList } from '@waldur/marketplace/common/StepsList';

import { OrderState } from './types';

interface ShoppingCartStepsProps {
  state: OrderState;
}

const STEPS = [
  'Configure',
  'Approve',
  'Review',
];

export const ShoppingCartSteps = (props: ShoppingCartStepsProps) => (
  <StepsList choices={STEPS} value={props.state}/>
);

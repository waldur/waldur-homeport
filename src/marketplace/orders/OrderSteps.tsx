import * as React from 'react';

import { StepsList } from '@waldur/marketplace/common/StepsList';

import { OrderStep } from './types';

interface OrderStepsProps {
  step: OrderStep;
}

const STEPS = ['Configure', 'Approve', 'Review'];

export const OrderSteps = (props: OrderStepsProps) => (
  <StepsList choices={STEPS} value={props.step} />
);

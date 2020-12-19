import { FunctionComponent } from 'react';

import { StepsList } from '@waldur/marketplace/common/StepsList';

import { OrderStep } from './types';

interface OrderStepsProps {
  step: OrderStep;
}

const STEPS = ['Configure', 'Approve', 'Review'];

export const OrderSteps: FunctionComponent<OrderStepsProps> = (props) => (
  <StepsList choices={STEPS} value={props.step} />
);

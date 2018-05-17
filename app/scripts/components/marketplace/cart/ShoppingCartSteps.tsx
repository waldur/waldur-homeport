import * as React from 'react';

import { Step } from './ShoppingCartStep';
import './ShoppingCartSteps.scss';
import { OrderState } from './types';

interface ShoppingCartStepsProps {
  state: OrderState;
}

const STEPS = [
  'Configure',
  'Approve',
  'Review',
];

export const ShoppingCartSteps = (props: ShoppingCartStepsProps) => {
  const stepIndex = STEPS.indexOf(props.state);

  return (
    <div className="shopping-cart-steps">
      {STEPS.map((title, index) => (
        <Step
          key={index}
          title={`${index + 1}. ${title}`}
          complete={stepIndex > index}
          active={stepIndex === index}
        />
      ))}
    </div>
  );
};

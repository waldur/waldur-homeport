import * as React from 'react';

import { Step } from './ShoppingCartStep';
import './ShoppingCartSteps.scss';

interface ShoppingCartStepsProps {
  stage: 1 | 2 | 3;
}

export const ShoppingCartSteps = (props: ShoppingCartStepsProps) => (
  <div className="shopping-cart-steps">
    {['Configure', 'Request approval', 'Review'].map((title, index) => (
      <Step
        key={index}
        title={`${index + 1}. ${title}`}
        complete={props.stage > index + 1}
        active={props.stage === index + 1}
      />
    ))}
  </div>
);

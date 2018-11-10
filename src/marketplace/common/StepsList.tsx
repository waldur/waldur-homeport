import * as classNames from 'classnames';
import * as React from 'react';

import { Step } from './Step';
import './StepsList.scss';

interface StepsListProps {
  choices: string[];
  value: string;
  onClick?(step: string): void;
  disabled?: boolean;
}

export const StepsList = (props: StepsListProps) => {
  const stepIndex = props.choices.indexOf(props.value);

  return (
    <div className={classNames({disabled: props.disabled}, 'shopping-cart-steps')}>
      {props.choices.map((title, index) => (
        <Step
          key={index}
          title={`${index + 1}. ${title}`}
          complete={stepIndex > index}
          active={stepIndex === index}
          onClick={() => props.onClick && props.onClick(title)}
        />
      ))}
    </div>
  );
};

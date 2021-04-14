import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { Step } from './Step';
import './StepsList.scss';

interface StepsListProps {
  choices: string[];
  value: string;
  onClick?(step: string): void;
  disabled?: boolean;
  getTabLabel?(tab: string): string;
}

export const StepsList: FunctionComponent<StepsListProps> = (props) => {
  const stepIndex = props.choices.indexOf(props.value);

  return (
    <div
      className={classNames(
        { disabled: props.disabled },
        'shopping-cart-steps',
      )}
    >
      {props.choices.map((stepId, index) => (
        <Step
          key={index}
          title={`${index + 1}. ${props.getTabLabel(stepId)}`}
          complete={stepIndex > index}
          active={stepIndex === index}
          onClick={() => props.onClick && props.onClick(stepId)}
        />
      ))}
    </div>
  );
};

StepsList.defaultProps = {
  getTabLabel: (s) => s,
};

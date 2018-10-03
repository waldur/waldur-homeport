import * as classNames from 'classnames';
import * as React from 'react';

interface StepProps {
  active?: boolean;
  complete?: boolean;
  title: string;
}

export const Step: React.SFC<StepProps> = (props: StepProps) => (
  <a className={classNames('step', {active: props.active})}>
    <h4 className="step-title">
      {props.complete && <i className="fa fa-check-circle"/>}
      {' '}
      {props.title}
    </h4>
  </a>
);

Step.defaultProps = {
  active: false,
  complete: false,
};

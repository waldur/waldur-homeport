import classNames from 'classnames';
import { FunctionComponent } from 'react';

interface StepProps {
  active?: boolean;
  complete?: boolean;
  title: string;
  onClick?(): void;
  disabled?: boolean;
}

export const Step: FunctionComponent<StepProps> = (props) => (
  <button
    className={classNames('step', {
      active: props.active,
      disabled: props.disabled,
    })}
    type="button"
    onClick={() => props.onClick()}
  >
    <h4 className="step-title">
      {props.complete && <i className="fa fa-check-circle" />} {props.title}
    </h4>
  </button>
);

Step.defaultProps = {
  active: false,
  complete: false,
};

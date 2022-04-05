import { FunctionComponent } from 'react';

interface SubmitButtonProps {
  submitting: boolean;
  label: string;
  disabled?: boolean;
  className?: string;
  onClick?(): void;
}

export const SubmitButton: FunctionComponent<SubmitButtonProps> = (props) => (
  <button
    type="submit"
    className={props.className}
    disabled={props.submitting || props.disabled === true}
    onClick={props.onClick}
  >
    {props.submitting && <i className="fa fa-spinner fa-spin me-1" />}
    {props.label}
  </button>
);

SubmitButton.defaultProps = {
  className: 'btn btn-primary',
};

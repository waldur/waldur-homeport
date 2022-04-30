import { FunctionComponent } from 'react';

interface SubmitButtonProps {
  submitting: boolean;
  label: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  onClick?(): void;
}

export const SubmitButton: FunctionComponent<SubmitButtonProps> = (props) => (
  <button
    id={props.id}
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

import * as React from 'react';

interface SubmitButtonProps {
  submitting: boolean;
  label: string;
  disabled?: boolean;
  className?: string;
}

export const SubmitButton: React.SFC<SubmitButtonProps> = (props: SubmitButtonProps) => (
  <button
    type="submit"
    className={props.className}
    disabled={props.submitting || props.disabled === true}>
    {props.submitting && (
      <i className="fa fa-spinner fa-spin m-r-xs"/>
    )}
    {props.label}
  </button>
);

SubmitButton.defaultProps = {
  className: 'btn btn-primary',
};

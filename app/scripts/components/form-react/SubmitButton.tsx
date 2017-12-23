import * as React from 'react';

interface SubmitButtonProps {
  submitting: boolean;
  label: string;
}

export const SubmitButton = (props: SubmitButtonProps) => (
  <button
    type="submit"
    className="btn btn-primary"
    disabled={props.submitting}>
    {props.submitting && (
      <i className="fa fa-spinner fa-spin m-r-xs"/>
    )}
    {props.label}
  </button>
);

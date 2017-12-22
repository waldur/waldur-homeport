import * as React from 'react';

interface Props {
  submitting: boolean;
  label: string;
}

export const SubmitButton = (props: Props) => (
  <button
    type="submit"
    className="btn btn-default"
    disabled={props.submitting}>
    {props.submitting && (
      <i className="fa fa-spinner fa-spin m-r-xs"/>
    )}
    {props.label}
  </button>
);

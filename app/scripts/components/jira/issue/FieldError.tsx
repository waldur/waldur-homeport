import * as React from 'react';

interface Props {
  error?: string;
}

export const FieldError = (props: Props) => (
  props.error && (
    <div className="help-block text-danger">
      {props.error}
    </div>
  )
);

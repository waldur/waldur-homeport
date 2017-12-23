import * as React from 'react';

interface FieldErrorProps {
  error?: string;
}

export const FieldError = (props: FieldErrorProps) => (
  props.error ? (
    <div className="help-block text-danger">
      {props.error}
    </div>
  ) : null
);

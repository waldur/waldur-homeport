import { FunctionComponent } from 'react';

interface FieldErrorProps {
  error?: string;
}

export const FieldError: FunctionComponent<FieldErrorProps> = (props) =>
  props.error ? (
    <div className="help-block text-danger">{props.error}</div>
  ) : null;

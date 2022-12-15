import { FunctionComponent } from 'react';

interface FieldErrorProps {
  error?: string | object | Array<any>;
}

export const FieldError: FunctionComponent<FieldErrorProps> = (props) =>
  props.error ? (
    <div className="help-block text-danger">
      {Array.isArray(props.error)
        ? props.error.map((e, i) => <div key={i}>{e}</div>)
        : typeof props.error === 'object'
        ? Object.values(props.error).map((e, i) => <div key={i}>{e}</div>)
        : props.error}
    </div>
  ) : null;

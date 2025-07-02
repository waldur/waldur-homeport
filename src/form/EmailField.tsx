import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { FormField } from './types';

interface EmailFieldProps extends FormField {
  maxLength?: number;
  solid?: boolean;
  placeholder?: string;
}

export const EmailField: FunctionComponent<EmailFieldProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, solid, ...rest } = props;
  return (
    <Form.Control
      {...props.input}
      type="email"
      className={solid && 'form-control-solid'}
      {...rest}
    />
  );
};

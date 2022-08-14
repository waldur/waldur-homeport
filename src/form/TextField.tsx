import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { FormField } from './types';

interface TextFieldProps extends FormField {
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  style?;
}

export const TextField: FunctionComponent<TextFieldProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, rows, hideLabel, validate, ...rest } = props;
  return (
    <Form.Control
      as="textarea"
      className="form-control-solid"
      style={props.style}
      placeholder="  "
      {...props.input}
      rows={rows ? rows : 5}
      {...rest}
    />
  );
};

import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { FormField } from './types';

interface StringFieldProps extends FormField {
  placeholder?: string;
  style?: any;
  maxLength?: number;
  pattern?: string;
  autoFocus?: boolean;
}

export const StringField: FunctionComponent<StringFieldProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;
  return (
    <Form.Control
      className="form-control-solid"
      {...props.input}
      type="text"
      {...rest}
    />
  );
};

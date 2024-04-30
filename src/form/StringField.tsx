import { FC } from 'react';
import { Form } from 'react-bootstrap';

import { FormField } from './types';

interface StringFieldProps extends FormField {
  placeholder?: string;
  style?: any;
  maxLength?: number;
  pattern?: string;
  autoFocus?: boolean;
}

export const StringField: FC<StringFieldProps> = ({
  input,
  placeholder = '  ',
  ...rest
}) => (
  <Form.Control
    className="form-control-solid"
    type="text"
    placeholder={placeholder}
    {...input}
    {...rest}
  />
);

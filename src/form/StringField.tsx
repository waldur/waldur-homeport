import { FC } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';

import { FormField } from './types';

interface StringFieldProps extends FormField, Omit<FormControlProps, 'onBlur'> {
  placeholder?: string;
  style?: any;
  maxLength?: number;
  pattern?: string;
  autoFocus?: boolean;
  solid?: boolean;
}

export const StringField: FC<StringFieldProps> = ({
  input,
  placeholder = '  ',
  solid,
  ...rest
}) => (
  <Form.Control
    className={solid && 'form-control-solid'}
    type="text"
    placeholder={placeholder}
    {...input}
    {...rest}
  />
);

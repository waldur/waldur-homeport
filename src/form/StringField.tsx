import { FC, ReactNode } from 'react';
import { Form, FormControlProps, InputGroup } from 'react-bootstrap';

import { FormField } from './types';

interface StringFieldProps extends FormField, Omit<FormControlProps, 'onBlur'> {
  placeholder?: string;
  style?: any;
  maxLength?: number;
  pattern?: string;
  autoFocus?: boolean;
  solid?: boolean;
  icon?: ReactNode;
}

const FormControlPure = ({ solid = false, placeholder = ' ', ...props }) => (
  <Form.Control
    className={solid && 'form-control-solid'}
    type="text"
    placeholder={placeholder}
    {...props}
  />
);

export const StringField: FC<StringFieldProps> = ({ input, icon, ...rest }) =>
  !icon ? (
    <FormControlPure {...input} {...rest} />
  ) : (
    <InputGroup className="has-icon">
      <div className="input-group-icon">{icon}</div>
      <FormControlPure {...input} {...rest} />
    </InputGroup>
  );

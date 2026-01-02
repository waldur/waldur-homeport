import { omit } from 'lodash-es';
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

// Props that should not be passed to DOM elements
const FORM_FIELD_PROPS = [
  'validate',
  'normalize',
  'format',
  'parse',
  'meta',
  'noUpdateOnBlur',
  'containerClassName',
  'spaceless',
  'space',
  'hideLabel',
] as const;

const FormControlPure = ({ solid = false, placeholder = ' ', ...props }) => (
  <Form.Control
    className={solid && 'form-control-solid'}
    type="text"
    placeholder={placeholder}
    {...props}
  />
);

export const StringField: FC<StringFieldProps> = ({ input, icon, ...rest }) => {
  const props = omit(rest, FORM_FIELD_PROPS);
  return !icon ? (
    <FormControlPure {...input} {...props} />
  ) : (
    <InputGroup className="has-icon">
      <div className="input-group-icon">{icon}</div>
      <FormControlPure {...input} {...props} />
    </InputGroup>
  );
};

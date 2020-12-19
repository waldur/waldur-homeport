import { FunctionComponent } from 'react';
import { ControlLabel, FormGroup } from 'react-bootstrap';
import { Field } from 'redux-form';

import { InputField } from '@waldur/form/InputField';

interface InputGroupProps {
  name: string;
  label: string;
  type?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
}

export const InputGroup: FunctionComponent<InputGroupProps> = ({
  name,
  disabled,
  label,
  required,
  type,
  helpText,
}) => (
  <FormGroup>
    <ControlLabel>
      {label}
      {required && <span className="text-danger">*</span>}
    </ControlLabel>
    <Field
      name={name}
      component={InputField}
      required={required}
      disabled={disabled}
      type={type}
    />
    {helpText && <p className="help-block m-b-n-xs text-muted">{helpText}</p>}
  </FormGroup>
);

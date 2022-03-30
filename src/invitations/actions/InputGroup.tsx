import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
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
  <Form.Group>
    <Form.Label>
      {label}
      {required && <span className="text-danger">*</span>}
    </Form.Label>
    <Field
      name={name}
      component={InputField}
      required={required}
      disabled={disabled}
      type={type}
    />
    {helpText && (
      <Form.Text muted={true} className="m-b-n-xs">
        {helpText}
      </Form.Text>
    )}
  </Form.Group>
);

import { Form } from 'react-bootstrap';

import { FieldError } from '@waldur/form';

import { FormGroup } from './FormGroup';

export const FormGroupWithError = (inputProps) => (
  <FormGroup
    label={inputProps.label}
    description={inputProps.description}
    required={inputProps.required}
  >
    <Form.Control
      {...inputProps.input}
      disabled={inputProps.disabled}
      readOnly={inputProps.readOnly}
      type="text"
    />
    {inputProps.meta.touched && <FieldError error={inputProps.meta.error} />}
  </FormGroup>
);

import { Form } from 'react-bootstrap';

import { FieldError } from '@/form';

import { FormGroup } from './FormGroup';

export const FormGroupWithError = (inputProps) => (
  <FormGroup
    label={inputProps.label}
    help={inputProps.description}
    helpEnd
    required={inputProps.required}
    space={5}
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

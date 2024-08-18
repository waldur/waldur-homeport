import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { FieldError } from '@waldur/form';

export const InputGroup = (props) => (
  <Form.Group className="mb-7">
    {props.label && (
      <Form.Label>
        {props.label}{' '}
        {props.required && <span className="text-danger"> *</span>}
      </Form.Label>
    )}
    <Field {...props} />
    <Field
      name={props.name}
      component={({ meta }) =>
        meta.touched && <FieldError error={meta.error} />
      }
      validate={props.validate}
    />
    {props.helpText && <Form.Text muted={true}>{props.helpText}</Form.Text>}
  </Form.Group>
);

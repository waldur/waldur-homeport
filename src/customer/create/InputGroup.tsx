import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { FieldError } from '@waldur/form';

export const InputGroup = ({
  label,
  helpText,
  validate,
  className,
  ...props
}: any) => (
  <Form.Group className={className}>
    <Form.Label>
      {label} {props.required && <span className="text-danger"> *</span>}
    </Form.Label>
    <Field {...props} />
    <Field
      name={props.name}
      component={({ meta }) =>
        meta.touched && <FieldError error={meta.error} />
      }
      validate={validate}
    />
    {helpText && <Form.Text muted={true}>{helpText}</Form.Text>}
  </Form.Group>
);

import classNames from 'classnames';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { FieldError } from '@waldur/form';

export const InputGroup = ({ floating = true, ...props }) => (
  <Form.Group className={classNames({ 'form-floating': floating }, 'mb-7')}>
    {!floating && props.label && (
      <Form.Label>
        {props.label}{' '}
        {props.required && <span className="text-danger"> *</span>}
      </Form.Label>
    )}
    <Field {...props} />
    {floating && props.label && (
      <Form.Label>
        {props.label}{' '}
        {props.required && <span className="text-danger"> *</span>}
      </Form.Label>
    )}
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

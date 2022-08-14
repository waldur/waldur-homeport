import classNames from 'classnames';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { FieldError } from '@waldur/form';

export const InputGroup = ({
  label,
  helpText,
  validate,
  floating,
  ...props
}: any) => (
  <Form.Group className={classNames({ 'form-floating': floating }, 'mb-7')}>
    {!floating && label && (
      <Form.Label>
        {label} {props.required && <span className="text-danger"> *</span>}
      </Form.Label>
    )}
    <Field {...props} />
    {floating && label && (
      <Form.Label>
        {label} {props.required && <span className="text-danger"> *</span>}
      </Form.Label>
    )}
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

InputGroup.defaultProps = {
  floating: true,
};

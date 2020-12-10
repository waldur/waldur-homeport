import { ControlLabel, FormGroup, HelpBlock } from 'react-bootstrap';
import { Field } from 'redux-form';

import { FieldError } from '@waldur/form';

export const InputGroup = ({ label, helpText, validate, ...props }: any) => (
  <FormGroup>
    <ControlLabel>
      {label} {props.required && <span className="text-danger"> *</span>}
    </ControlLabel>
    <Field {...props} />
    <Field
      name={props.name}
      component={({ meta }) =>
        meta.touched && <FieldError error={meta.error} />
      }
      validate={validate}
    />
    {helpText && (
      <HelpBlock>
        <span className="text-muted">{helpText}</span>
      </HelpBlock>
    )}
  </FormGroup>
);

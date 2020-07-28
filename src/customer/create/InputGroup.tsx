import * as React from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import { Field } from 'redux-form';

import { FieldError } from '@waldur/form';

export const InputGroup = ({ label, helpText, ...props }: any) => (
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
    />
    {helpText && (
      <HelpBlock>
        <span className="text-muted">{helpText}</span>
      </HelpBlock>
    )}
  </FormGroup>
);

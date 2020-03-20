import * as React from 'react';
import * as Checkbox from 'react-bootstrap/lib/Checkbox';
import * as Col from 'react-bootstrap/lib/Col';
import * as FormGroup from 'react-bootstrap/lib/FormGroup';
import * as HelpBlock from 'react-bootstrap/lib/HelpBlock';
import { Field } from 'redux-form';

import { DecoratedLabel } from './DecoratedLabel';
import { FieldProps } from './types';

export const BooleanField: React.FC<FieldProps> = props => (
  <Col sm={6}>
    <FormGroup>
      <Field
        name={props.variable}
        component={fieldProps => (
          <Checkbox {...fieldProps.input}>
            <DecoratedLabel label={props.label} required={props.required} />
          </Checkbox>
        )}
      />
      {props.description && <HelpBlock>{props.description}</HelpBlock>}
    </FormGroup>
  </Col>
);

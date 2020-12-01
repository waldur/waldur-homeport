import React from 'react';
import { Checkbox, Col, FormGroup, HelpBlock } from 'react-bootstrap';
import { Field } from 'redux-form';

import { FieldProps } from '../types';

import { DecoratedLabel } from './DecoratedLabel';

const renderControl = (props) => (
  <Checkbox
    checked={props.input.value}
    onChange={(e: React.ChangeEvent<any>) =>
      props.input.onChange(e.target.checked)
    }
  >
    <DecoratedLabel label={props.label} required={props.required} />
  </Checkbox>
);

export const BooleanField: React.FC<FieldProps> = (props) => (
  <Col sm={6}>
    <FormGroup>
      <Field
        name={props.variable}
        component={renderControl}
        label={props.label}
        required={props.required}
      />
      {props.description && <HelpBlock>{props.description}</HelpBlock>}
    </FormGroup>
  </Col>
);

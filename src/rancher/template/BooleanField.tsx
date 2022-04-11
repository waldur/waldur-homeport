import React from 'react';
import { Col, Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { FieldProps } from '../types';

import { DecoratedLabel } from './DecoratedLabel';

const renderControl = (props) => (
  <Form.Check
    checked={props.input.value}
    onChange={(e: React.ChangeEvent<any>) =>
      props.input.onChange(e.target.checked)
    }
  >
    <DecoratedLabel label={props.label} required={props.required} />
  </Form.Check>
);

export const BooleanField: React.FC<FieldProps> = (props) => (
  <Col sm={6}>
    <Form.Group>
      <Field
        name={props.variable}
        component={renderControl}
        label={props.label}
        required={props.required}
      />
      {props.description && <p>{props.description}</p>}
    </Form.Group>
  </Col>
);

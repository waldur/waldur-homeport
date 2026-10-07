import React from 'react';
import { Col, Form } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { Checkbox } from 'waldur-ui';

import { FieldProps } from '../types';

import { DecoratedLabel } from './DecoratedLabel';

const renderControl = (props) => (
  // react-bootstrap's Form.Check rendered its children *instead of* the
  // input, so this field used to show a label and no checkbox at all.
  <Checkbox
    checked={Boolean(props.input.value)}
    onChange={(e) => props.input.onChange(e.target.checked)}
    label={<DecoratedLabel label={props.label} required={props.required} />}
  />
);

export const BooleanField: React.FC<FieldProps> = (props) => (
  <Col sm={6}>
    <Form.Group>
      <Field
        name={props.variable}
        type="checkbox"
        component={renderControl}
        label={props.label}
        required={props.required}
      />

      {props.description && <p>{props.description}</p>}
    </Form.Group>
  </Col>
);

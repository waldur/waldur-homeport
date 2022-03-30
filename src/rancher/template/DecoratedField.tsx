import React from 'react';
import { Col, Form } from 'react-bootstrap';
import { Field, WrappedFieldProps } from 'redux-form';

import { required } from '@waldur/core/validators';

import { FieldProps } from '../types';

import { DecoratedLabel } from './DecoratedLabel';

interface OwnProps extends FieldProps {
  component: React.ComponentType<WrappedFieldProps>;
  action?: React.ReactNode;
  validate?: any;
}

export const DecoratedField: React.FC<OwnProps> = (props) => (
  <Col sm={6}>
    <Form.Group>
      {props.action ? (
        <div className="pull-right">
          <small>{props.action}</small>
        </div>
      ) : null}
      <p>
        <DecoratedLabel label={props.label} required={props.required} />
      </p>
      <Field
        name={props.variable}
        component={props.component}
        validate={
          props.validate
            ? props.validate
            : props.required
            ? required
            : undefined
        }
      />
      <Form.Text muted={true}>{props.description}</Form.Text>
    </Form.Group>
  </Col>
);

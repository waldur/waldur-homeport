import React from 'react';
import { Col, Form } from 'react-bootstrap';
import { Field, FieldRenderProps } from 'react-final-form';

import { composeValidators, required } from '@/core/validators';

import { FieldProps } from '../types';

import { DecoratedLabel } from './DecoratedLabel';

interface OwnProps extends FieldProps {
  component: React.ComponentType<FieldRenderProps<any, any>>;
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
      <Form.Label htmlFor={props.variable}>
        <DecoratedLabel label={props.label} required={props.required} />
      </Form.Label>
      <Field
        id={props.variable}
        name={props.variable}
        component={props.component}
        validate={
          props.validate
            ? Array.isArray(props.validate)
              ? composeValidators(...props.validate)
              : props.validate
            : props.required
              ? required
              : undefined
        }
      />

      <Form.Text muted={true}>{props.description}</Form.Text>
    </Form.Group>
  </Col>
);

import React from 'react';
import { Col } from 'react-bootstrap';
import { Field, FieldRenderProps } from 'react-final-form';

import { FormField, FormLabel, FormText } from 'waldur-ui';

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
    <FormField controlId={props.variable}>
      {props.action ? (
        <div className="pull-right">
          <small>{props.action}</small>
        </div>
      ) : null}
      <FormLabel>
        <DecoratedLabel label={props.label} required={props.required} />
      </FormLabel>
      <Field
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

      <FormText variant="muted">{props.description}</FormText>
    </FormField>
  </Col>
);

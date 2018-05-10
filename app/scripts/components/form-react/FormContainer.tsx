import * as React from 'react';
import { Field } from 'redux-form';

import { FormGroup } from './FormGroup';

interface FormContainerProps {
  children: React.ReactNode;
  submitting: boolean;
  clearOnUnmount?: boolean;
  labelClass?: string;
  controlClass?: string;
}

export const FormContainer = (props: FormContainerProps) => (
  <div>
    {React.Children.map(props.children, (input: any) => (input && input.props.name ?
      <Field
        {...input.props}
        component={FormGroup}
        children={input}
        disabled={props.submitting || input.props.disabled}
        labelClass={props.labelClass}
        controlClass={props.controlClass}
        clearOnUnmount={props.clearOnUnmount}
      /> : input
    ))}
  </div>
);

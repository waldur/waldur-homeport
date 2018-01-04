import * as React from 'react';
import { Field } from 'redux-form';

import { FormGroup } from './FormGroup';

interface FormContainerProps {
  children: React.ReactNode;
  submitting: boolean;
  labelClass?: string;
  controlClass?: string;
}

export const FormContainer = (props: FormContainerProps) => (
  <div>
    {React.Children.map(props.children, input => (input &&
      <Field
        {...(input as any).props}
        component={FormGroup}
        children={input}
        disabled={props.submitting}
        labelClass={props.labelClass}
        controlClass={props.controlClass}
      />
    ))}
  </div>
);

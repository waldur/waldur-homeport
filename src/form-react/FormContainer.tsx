import * as React from 'react';
import { Field } from 'redux-form';

import { FormGroup } from './FormGroup';

interface FormContainerProps {
  submitting: boolean;
  clearOnUnmount?: boolean;
  labelClass?: string;
  controlClass?: string;
  layout?: 'horizontal' | 'vertical';
}

export const FormContainer: React.FC<FormContainerProps> = props => (
  <div>
    {React.Children.map(props.children, (input: any) =>
      input && input.props && input.props.name ? (
        <Field
          {...input.props}
          component={FormGroup}
          disabled={props.submitting || input.props.disabled}
          labelClass={props.labelClass}
          controlClass={props.controlClass}
          clearOnUnmount={props.clearOnUnmount}
          layout={props.layout}
        >
          {input}
        </Field>
      ) : (
        input
      ),
    )}
  </div>
);

FormContainer.defaultProps = {
  layout: 'horizontal',
};

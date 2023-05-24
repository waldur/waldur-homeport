import React from 'react';
import { Field } from 'redux-form';

import { FormGroup } from './FormGroup';

export interface FormContainerProps {
  className?: string;
  submitting: boolean;
  clearOnUnmount?: boolean;
  floating?: boolean;
}

export const FormContainer: React.FC<FormContainerProps> = (props) => {
  const { className = 'size-sm' } = props;

  return (
    <div className={className}>
      {React.Children.map(props.children, (input: any) =>
        input && input.props && input.props.name ? (
          <Field
            floating={props.floating}
            {...input.props}
            component={FormGroup}
            disabled={props.submitting || input.props.disabled}
            clearOnUnmount={props.clearOnUnmount}
            validate={input.props.validate}
          >
            {input}
          </Field>
        ) : (
          input
        ),
      )}
    </div>
  );
};

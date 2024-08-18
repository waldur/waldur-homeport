import React, { PropsWithChildren } from 'react';
import { Field } from 'redux-form';

import { FormGroup } from './FormGroup';

export interface FormContainerProps {
  className?: string;
  submitting: boolean;
  clearOnUnmount?: boolean;
}

export const FormContainer: React.FC<PropsWithChildren<FormContainerProps>> = (
  props,
) => {
  const { className = 'size-sm' } = props;

  return (
    <div className={className}>
      {React.Children.map(props.children, (input: any) =>
        input && input.props && input.props.name ? (
          <Field
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

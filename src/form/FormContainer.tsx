import React, { PropsWithChildren } from 'react';
import { Row } from 'react-bootstrap';
import { Field } from 'redux-form';

import { FormGroup } from './FormGroup';

export interface FormContainerProps {
  className?: string;
  submitting: boolean;
  clearOnUnmount?: boolean;
  asRow?: boolean;
  space?: number;
}

export const FormContainer: React.FC<PropsWithChildren<FormContainerProps>> = (
  props,
) => {
  const { className = 'size-sm' } = props;

  const Container = props.asRow ? Row : React.Fragment;

  return (
    <div className={className}>
      <Container>
        {React.Children.map(props.children, (input: any) =>
          input && input.props && input.props.name ? (
            <Field
              space={props.space}
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
      </Container>
    </div>
  );
};

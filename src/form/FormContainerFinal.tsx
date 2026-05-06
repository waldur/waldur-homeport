import React, { PropsWithChildren } from 'react';
import { Row } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { FormGroupFinal } from './FormGroupFinal';

interface FormContainerProps {
  className?: string;
  submitting?: boolean;
  asRow?: boolean;
  space?: number;
}

export const FormContainerFinal: React.FC<
  PropsWithChildren<FormContainerProps>
> = (props) => {
  const { className = 'size-sm' } = props;

  const Container = props.asRow ? Row : React.Fragment;

  return (
    <div className={className}>
      <Container>
        {React.Children.map(props.children, (input: any) =>
          input && input.props && input.props.name ? (
            <Field
              key={input.props.name}
              space={props.space}
              {...input.props}
              component={FormGroupFinal}
              disabled={props.submitting || input.props.disabled}
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

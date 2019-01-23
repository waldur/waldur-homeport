import * as React from 'react';

import { FieldError } from './FieldError';
import { FormGroupProps } from './FormGroup';

interface FieldValidationWrapperProps extends FormGroupProps {
  field: any;
}

export const FieldValidationWrapper = (props: FieldValidationWrapperProps) => {
  const {field, ...rest} = props;
  return (
    <>
      {React.createElement(field, {...rest})}
      {props.meta.touched && <FieldError error={props.meta.error} />}
    </>
  );
};

import { createElement } from 'react';

import { FieldError } from './FieldError';
import { FormGroupProps } from './FormGroup';

export const renderValidationWrapper = (field) => (props: FormGroupProps) => (
  <>
    {createElement(field, { ...props })}
    {props.meta.touched && <FieldError error={props.meta.error} />}
  </>
);

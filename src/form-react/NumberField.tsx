import * as React from 'react';

import { FormField } from './types';

interface NumberFieldProps extends FormField {
  step?: number | string;
  min?: number | string;
  max?: number | string;
}

export const NumberField = (props: NumberFieldProps) => {
  const { input, label, validate, ...rest } = props;
  return (
    <input
      {...props.input}
      type="number"
      className="form-control"
      {...rest}
    />
  );
};

import * as React from 'react';

import { FormField } from './types';

interface TextFieldProps extends FormField {
  maxLength?: number;
  placeholder?: string;
  rows?: number;
}

export const TextField = (props: TextFieldProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, rows, hideLabel, validate, ...rest } = props;
  return (
    <textarea
      {...props.input}
      rows={rows ? rows : 5}
      className="form-control"
      {...rest}
    />
  );
};

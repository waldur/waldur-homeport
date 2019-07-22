import * as React from 'react';

import { FormField } from './types';

interface TextFieldProps extends FormField {
  maxLength?: number;
  placeholder?: string;
}

export const TextField = (props: TextFieldProps) => {
  const { input, label, hideLabel, ...rest } = props;
  return (
    <textarea
      {...props.input}
      rows={5}
      className="form-control"
      {...rest}
    />
  );
};

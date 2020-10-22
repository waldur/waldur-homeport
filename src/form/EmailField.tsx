import * as React from 'react';

import { FormField } from './types';

interface EmailFieldProps extends FormField {
  maxLength?: number;
}

export const EmailField = (props: EmailFieldProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;
  return (
    <input {...props.input} type="email" className="form-control" {...rest} />
  );
};

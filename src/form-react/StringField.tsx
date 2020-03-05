import * as React from 'react';

import { FormField } from './types';

interface StringFieldProps extends FormField {
  placeholder?: string;
  style?: any;
  maxLength?: number;
}

export const StringField = (props: StringFieldProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;
  return (
    <input {...props.input} type="text" className="form-control" {...rest} />
  );
};

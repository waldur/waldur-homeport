import * as React from 'react';

import { FormField } from './types';

export const EmailField = (props: FormField) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;
  return (
    <input {...props.input} type="email" className="form-control" {...rest} />
  );
};

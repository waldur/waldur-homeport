import * as React from 'react';

import { FormField } from './types';

export const NumberField = (props: FormField) => {
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

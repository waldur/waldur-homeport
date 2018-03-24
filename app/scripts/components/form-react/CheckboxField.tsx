import * as React from 'react';

import { FormField } from './types';

export const CheckboxField = (props: FormField) => {
  const { input, label, validate, ...rest } = props;
  return (
    <input
      {...props.input}
      type="checkbox"
      {...rest}
    />
  );
};

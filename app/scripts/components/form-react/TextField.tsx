import * as React from 'react';

import { FormField } from './types';

export const TextField = (props: FormField) => {
  const { input, ...rest } = props;
  return (
    <textarea
      {...props.input}
      rows={5}
      className="form-control"
      {...rest}
    />
  );
};

import * as React from 'react';

import { FormField } from './types';

export const StringField = (props: FormField) => {
  const { input, ...rest } = props;
  return (
    <input
      {...props.input}
      type="text"
      className="form-control"
      {...rest}
    />
  );
};

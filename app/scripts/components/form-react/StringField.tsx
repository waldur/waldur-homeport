import * as React from 'react';

import { FormField } from './types';

export const StringField = (props: FormField) => {
  const { input, label, ...rest } = props;
  return (
    <input
      {...props.input}
      type="text"
      className="form-control"
      {...rest}
    />
  );
};

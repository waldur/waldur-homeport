import * as React from 'react';
import FormControl from 'react-bootstrap/lib/FormControl';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const InputField = ({ input, meta, ...props }) => (
  <FormControl {...input} {...props} />
);

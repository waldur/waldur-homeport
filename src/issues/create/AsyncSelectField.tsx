import * as React from 'react';
import { Async } from 'react-select';

export const AsyncSelectField = ({
  input: { value, onChange },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  meta,
  componentRef,
  ...props
}: any) => (
  <Async value={value} onChange={onChange} {...props} ref={componentRef} />
);

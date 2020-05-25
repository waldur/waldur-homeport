import * as React from 'react';
import Radio from 'react-bootstrap/lib/Radio';

export const RadioField = ({
  input: { value, onChange },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  meta,
  groupName,
  ...props
}) => <Radio value={value} onChange={onChange} {...props} name={groupName} />;

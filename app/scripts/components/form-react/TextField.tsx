import * as React from 'react';

export const TextField = props => {
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

import * as React from 'react';

export const StringField = props => {
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

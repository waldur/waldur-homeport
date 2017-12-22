import * as React from 'react';
import Select from 'react-select';

export const SelectField = props => {
  const {input, ...rest} = props;
  return (
    <Select
      {...rest}
      name={input.name}
      value={input.value}
      onChange={value => input.onChange(value)}
      onBlur={() => input.onBlur(input.value)}
    />
  );
};

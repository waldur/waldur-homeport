import * as React from 'react';
import Select from 'react-select';

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

export const SelectField = options => props => {
  const {input, ...rest} = props;
  return (
    <Select
      {...rest}
      name={input.name}
      value={input.value}
      onChange={value => input.onChange(value)}
      onBlur={() => input.onBlur(input.value)}
      {...options}
      />
  );
};

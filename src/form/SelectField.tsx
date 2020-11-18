import * as React from 'react';
import Select from 'react-select';

export const SelectField = (props) => {
  const { input, simpleValue, options, ...rest } = props;
  return (
    <Select
      {...rest}
      name={input.name}
      value={
        (simpleValue || typeof input.value !== 'object') && options
          ? options.filter((option) => option.value === input.value)
          : input.value
      }
      onChange={(newValue: any) =>
        simpleValue ? input.onChange(newValue.value) : input.onChange(newValue)
      }
      options={options}
      onBlur={() => {
        if (!props.noUpdateOnBlur) {
          // See also: https://github.com/erikras/redux-form/issues/1185
          props.input.onBlur(props.input.value);
        }
      }}
    />
  );
};

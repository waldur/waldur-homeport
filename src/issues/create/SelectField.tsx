import * as React from 'react';
import Select from 'react-select';

export const SelectField = ({
  input: { value, onChange },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  meta,
  simpleValue,
  options,
  ...props
}) => (
  <Select
    value={
      simpleValue ? options.filter((option) => option.value === value) : value
    }
    onChange={(newValue: any) =>
      simpleValue ? onChange(newValue.value) : onChange(newValue)
    }
    options={options}
    {...props}
  />
);

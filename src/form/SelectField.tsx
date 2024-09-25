import { FunctionComponent } from 'react';

import { Select } from '@waldur/form/themed-select';

export const SelectField: FunctionComponent<any> = (props) => {
  const { input, simpleValue, options, ...rest } = props;
  const getOptionValue = props.getOptionValue || ((option) => option.value);
  return (
    <Select
      {...rest}
      name={input.name}
      value={
        (simpleValue || typeof input.value !== 'object') && options
          ? props.isMulti
            ? options.filter((option) =>
                input.value.includes(getOptionValue(option)),
              )
            : options.filter((option) => getOptionValue(option) === input.value)
          : input.value
      }
      onChange={(newValue: any) =>
        simpleValue
          ? input.onChange(
              newValue
                ? props.isMulti
                  ? newValue.map((v) => getOptionValue(v))
                  : getOptionValue(newValue)
                : null,
            )
          : input.onChange(newValue)
      }
      options={options}
      onBlur={() => {
        if (!props.noUpdateOnBlur) {
          // See also: https://github.com/erikras/redux-form/issues/1185
          props.input.onBlur(props.input.value);
        }
      }}
      className="metronic-select-container"
      classNamePrefix="metronic-select"
    />
  );
};

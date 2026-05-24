import { FunctionComponent } from 'react';

import { Select } from './Select';
import { SelectFieldProps } from './types';

export const SelectField: FunctionComponent<SelectFieldProps> = (props) => {
  const { input, simpleValue, options, ...rest } = props;
  const getOptionValue = props.getOptionValue || ((option) => option.value);

  return (
    <Select
      {...rest}
      id={undefined}
      inputId={input.name}
      data-testid={props['data-testid']}
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
      onChange={(newValue: any, actionMeta: any) => {
        if (simpleValue) {
          input.onChange(
            newValue
              ? props.isMulti
                ? newValue.map((v) => getOptionValue(v))
                : getOptionValue(newValue)
              : null,
          );
        } else {
          input.onChange(newValue);
        }
        if (props.onChange) {
          props.onChange(newValue, actionMeta);
        }
      }}
      options={options}
      onBlur={() => {
        if (!props.noUpdateOnBlur) {
          props.input.onBlur(props.input.value);
        }
      }}
      className={
        'metronic-select-container' +
        (props.className ? ` ${props.className}` : '')
      }
    />
  );
};

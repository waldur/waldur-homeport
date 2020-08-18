/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import AsyncSelect from 'react-select/async';

export const SelectAsyncField = (props) => {
  const {
    input,
    label,
    description,
    tooltip,
    hideLabel,
    labelClass,
    controlClass,
    validate,
    normalize,
    ...rest
  } = props;
  return React.createElement(AsyncSelect, {
    ...rest,
    name: input.name,
    value: input.value,
    onChange: (value) => input.onChange(value),
    onBlur: () => input.onBlur(input.value),
  });
};

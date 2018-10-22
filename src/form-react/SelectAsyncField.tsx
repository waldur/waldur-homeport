import * as React from 'react';
import { Async, ReactAsyncSelectProps } from 'react-select';

import { FormField } from './types';

interface SelectAsyncFieldProps extends ReactAsyncSelectProps, FormField {
  name: string;
}

export const SelectAsyncField = (props: SelectAsyncFieldProps) => {
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
    ...rest} = props;
  return React.createElement(Async, {
    ...rest,
    name: input.name,
    value: input.value,
    onChange: value => input.onChange(value),
    onBlur: () => input.onBlur(input.value),
  });
};

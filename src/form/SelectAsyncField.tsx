/* eslint-disable @typescript-eslint/no-unused-vars */
import { createElement } from 'react';
import { FunctionComponent } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';

export const SelectAsyncField: FunctionComponent<any> = (props) => {
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
  return createElement(AsyncPaginate, {
    ...rest,
    name: input.name,
    value: input.value,
    onChange: (value) => input.onChange(value),
    onBlur: () => input.onBlur(input.value),
  });
};

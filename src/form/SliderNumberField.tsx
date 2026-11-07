import { FC } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { SliderNumberInput, SliderNumberInputProps } from 'waldur-ui';

export interface SliderNumberFieldProps extends Omit<
  SliderNumberInputProps,
  'value' | 'onValueChange' | 'onBlur' | 'name' | 'invalid'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

/** The react-final-form adapter for waldur-ui's SliderNumberInput. */
export const SliderNumberField: FC<SliderNumberFieldProps> = ({
  input,
  meta,
  ...rest
}) => (
  <SliderNumberInput
    {...rest}
    name={input.name}
    value={input.value}
    onValueChange={input.onChange}
    onBlur={input.onBlur}
    invalid={meta.touched && !!meta.error}
  />
);

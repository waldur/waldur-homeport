import { FunctionComponent, ReactNode } from 'react';

import { RadioGroup, RadioGroupOption, RadioValue } from 'waldur-ui';

import { FormField } from './types';

interface RadioGroupFieldProps extends FormField {
  /** The options. `choices` is the older name, still accepted. */
  options?: readonly RadioGroupOption<RadioValue>[];
  choices?: readonly {
    value: RadioValue;
    label: ReactNode;
    description?: ReactNode;
    tooltip?: ReactNode;
  }[];
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md';
  /** Shown when the stored value is empty, as the form submits it too. */
  defaultValue?: RadioValue;
  className?: string;
}

/**
 * A react-final-form value as a waldur-ui `RadioGroup`: the group's legend
 * is the field label (see the form-level RadioGroup, which hands it over
 * instead of drawing it in its FormGroup), and the radios share the field's
 * name.
 */
export const RadioGroupField: FunctionComponent<RadioGroupFieldProps> = ({
  input,
  options,
  choices,
  label,
  tooltip,
  description,
  orientation,
  size,
  defaultValue,
  required,
  className,
  readOnly,
  disabled,
}) => (
  <RadioGroup
    options={options ?? choices ?? []}
    value={
      input.value === '' || input.value == null ? defaultValue : input.value
    }
    onValueChange={input.onChange}
    onBlur={input.onBlur}
    onFocus={input.onFocus}
    name={input.name}
    label={label}
    tooltip={tooltip}
    description={description}
    orientation={orientation}
    size={size}
    required={required}
    disabled={readOnly || disabled}
    className={className}
  />
);

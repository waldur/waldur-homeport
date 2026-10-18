import { FC } from 'react';
import { Field } from 'react-final-form';

import { NativeSelect } from 'waldur-ui';

const FormField: FC<any> = ({ input, ...rest }) => (
  <NativeSelect
    {...input}
    {...rest}
    value={input.value}
    onChange={(e) => input.onChange(e.target.value)}
  />
);

export const SelectField = ({ name, options, disabled = false }) => (
  <Field name={name} component={FormField} disabled={disabled}>
    {options.map((option, index) => (
      <option value={option.value} key={index}>
        {option.label}
      </option>
    ))}
  </Field>
);

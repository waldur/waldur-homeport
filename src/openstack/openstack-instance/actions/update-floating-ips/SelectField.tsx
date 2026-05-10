import { FC } from 'react';
import { FormControl } from 'react-bootstrap';
import { Field } from 'react-final-form';

const FormField: FC<any> = ({ input, ...rest }) => (
  <FormControl
    {...input}
    {...rest}
    as="select"
    value={input.value}
    onChange={(e: any) => input.onChange(e.target.value)}
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

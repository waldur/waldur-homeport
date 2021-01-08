import { FC } from 'react';
import { FormControl } from 'react-bootstrap';
import { Field, WrappedFieldProps } from 'redux-form';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormField: FC<WrappedFieldProps> = ({ input, meta, ...rest }) => (
  <FormControl value={input.value} onChange={input.onChange} {...rest} />
);

export const SelectField = ({ name, options, disabled = false }) => (
  <Field
    name={name}
    component={FormField}
    componentClass="select"
    disabled={disabled}
  >
    {options.map((subnet, index) => (
      <option value={subnet.value} key={index}>
        {subnet.display_name}
      </option>
    ))}
  </Field>
);

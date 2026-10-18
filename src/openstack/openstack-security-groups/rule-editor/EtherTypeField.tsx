import { FC } from 'react';
import { Field } from 'react-final-form';

import { FormSelectField } from './FormField';

export const EtherTypeField: FC<{ name: string; component?: any }> = ({
  name,
  component = FormSelectField,
}) => (
  <Field name={name} component={component}>
    <option value="IPv4">IPv4</option>
    <option value="IPv6">IPv6</option>
  </Field>
);

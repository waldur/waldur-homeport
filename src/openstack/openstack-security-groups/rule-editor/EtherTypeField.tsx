import { FC } from 'react';
import { Field } from 'redux-form';

import { FormField } from './FormField';

export const EtherTypeField: FC = () => (
  <Field name="ethertype" component={FormField} componentClass="select">
    <option value="IPv4">IPv4</option>
    <option value="IPv6">IPv6</option>
  </Field>
);

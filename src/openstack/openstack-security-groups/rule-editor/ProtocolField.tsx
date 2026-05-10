import { FC } from 'react';
import { Field } from 'react-final-form';

import { translate } from '@/i18n';

import { FormField } from './FormField';

export const ProtocolField: FC<{ name: string; component?: any }> = ({
  name,
  component = FormField,
}) => (
  <Field name={name} component={component} as="select">
    <option value="tcp">TCP</option>
    <option value="udp">UDP</option>
    <option value="icmp">ICMP</option>
    <option value="any">{translate('Any')}</option>
  </Field>
);

import { FC } from 'react';
import { Field } from 'react-final-form';

import { translate } from '@/i18n';

import { FormSelectField } from './FormField';

export const DirectionField: FC<{ name: string; component?: any }> = ({
  name,
  component = FormSelectField,
}) => (
  <Field name={name} component={component}>
    <option value="ingress">{translate('Ingress')}</option>
    <option value="egress">{translate('Egress')}</option>
  </Field>
);

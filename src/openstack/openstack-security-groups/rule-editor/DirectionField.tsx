import { FC } from 'react';
import { Field } from 'react-final-form';

import { translate } from '@/i18n';

import { FormField } from './FormField';

export const DirectionField: FC<{ name: string; component?: any }> = ({
  name,
  component = FormField,
}) => (
  <Field name={name} component={component} as="select">
    <option value="ingress">{translate('Ingress')}</option>
    <option value="egress">{translate('Egress')}</option>
  </Field>
);

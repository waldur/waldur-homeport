import { FC } from 'react';
import { Field } from 'react-final-form';

import { translate } from '@/i18n';

import { FormField } from './FormField';

export const DescriptionField: FC<{ name: string; component?: any }> = ({
  name,
  component = FormField,
}) => (
  <Field
    name={name}
    component={component}
    aria-label={translate('Description')}
  />
);

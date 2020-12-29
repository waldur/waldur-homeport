import { FC } from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FormField } from './FormField';

export const DirectionField: FC = () => (
  <Field name="direction" component={FormField} componentClass="select">
    <option value="ingress">{translate('Ingress')}</option>
    <option value="egress">{translate('Egress')}</option>
  </Field>
);

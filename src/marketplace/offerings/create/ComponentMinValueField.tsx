import React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { OptionalNumberField } from './OptionalNumberField';

export const ComponentMinValueField: React.FC = () => (
  <FormGroup label={translate('Minimum allowed value')}>
    <Field component={OptionalNumberField} name="min_value" />
  </FormGroup>
);

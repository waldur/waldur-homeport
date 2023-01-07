import React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { OptionalNumberField } from './OptionalNumberField';

export const ComponentMaxValueField: React.FC = () => (
  <FormGroup label={translate('Maximum allowed value')}>
    <Field
      component={OptionalNumberField}
      name="max_value"
      parse={(value) => Number(value)}
    />
  </FormGroup>
);

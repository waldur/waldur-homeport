import React from 'react';
import { Field } from 'redux-form';

import { NumberField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentMinValueField: React.FC = () => (
  <FormGroup label={translate('Min value')} spaceless>
    <Field
      component={NumberField}
      name="min_value"
      parse={(value) => Number(value)}
    />
  </FormGroup>
);

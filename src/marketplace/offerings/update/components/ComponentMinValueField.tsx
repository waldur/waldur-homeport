import React from 'react';
import { Field } from 'redux-form';

import { NumberField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

export const ComponentMinValueField: React.FC = () => (
  <FormGroup label={translate('Min value')} spaceless>
    <Field
      component={NumberField}
      name="min_value"
      parse={(value) => Number(value)}
    />
  </FormGroup>
);

import React from 'react';
import { Field } from 'react-final-form';

import { NumberField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

export const ComponentMinValueField: React.FC = () => (
  <FormGroup label={translate('Min value')} controlId="min_value" spaceless>
    <Field
      component={NumberField as any}
      name="min_value"
      id="min_value"
      parse={(value) => Number(value)}
    />
  </FormGroup>
);

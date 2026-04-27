import React from 'react';
import { Field } from 'redux-form';

import { NumberField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

export const ComponentMaxValueField: React.FC = () => (
  <FormGroup label={translate('Max value')} spaceless>
    <Field
      component={NumberField}
      name="max_value"
      parse={(value) => Number(value)}
    />
  </FormGroup>
);

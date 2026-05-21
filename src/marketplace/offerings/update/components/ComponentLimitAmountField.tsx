import React from 'react';
import { Field } from 'react-final-form';

import { NumberField } from '@/form';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

export const ComponentLimitAmountField: React.FC = () => (
  <FormGroup
    label={translate('Limit amount')}
    controlId="limit_amount"
    spaceless
  >
    <Field
      component={NumberField}
      name="limit_amount"
      id="limit_amount"
      min={0}
      parse={parseIntField}
      format={formatIntField}
    />
  </FormGroup>
);

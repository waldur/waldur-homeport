import React from 'react';
import { Field } from 'redux-form';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentLimitAmountField: React.FC = () => (
  <FormGroup label={translate('Limit amount')}>
    <Field
      component={InputField}
      name="limit_amount"
      type="number"
      min={0}
      parse={parseIntField}
      format={formatIntField}
    />
  </FormGroup>
);

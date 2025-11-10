import React from 'react';
import { Field } from 'redux-form';

import { NumberField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentLimitAmountField: React.FC = () => (
  <FormGroup label={translate('Limit amount')} spaceless>
    <Field
      component={NumberField}
      name="limit_amount"
      min={0}
      parse={parseIntField}
      format={formatIntField}
    />
  </FormGroup>
);

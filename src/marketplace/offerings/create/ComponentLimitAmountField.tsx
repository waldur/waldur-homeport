import React from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentLimitAmountField: React.FC = () => (
  <FormGroup label={translate('Limit amount')}>
    <Field
      component={Form.Control}
      name="limit_amount"
      type="number"
      min={0}
      parse={parseIntField}
      format={formatIntField}
    />
  </FormGroup>
);

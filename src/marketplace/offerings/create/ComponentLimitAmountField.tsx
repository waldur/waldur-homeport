import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface Props {
  component: string;
}

export const ComponentLimitAmountField = (props: Props) => (
  <FormGroup label={translate('Limit amount')}>
    <Field
      component="input"
      className="form-control"
      name={`${props.component}.limit_amount`}
      type="number"
      min={0}
    />
  </FormGroup>
);

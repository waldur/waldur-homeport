import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface Props {
  component: string;
}

export const ComponentMeasuredUnitField = (props: Props) => (
  <FormGroup label={translate('Measured unit')}>
    <Field
      component="input"
      className="form-control"
      name={`${props.component}.measured_unit`}
      type="text"
    />
  </FormGroup>
);

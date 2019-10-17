import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentMeasuredUnitField: React.FC<{}> = () => (
  <FormGroup label={translate('Measured unit')}>
    <Field
      component="input"
      className="form-control"
      name="measured_unit"
      type="text"
    />
  </FormGroup>
);

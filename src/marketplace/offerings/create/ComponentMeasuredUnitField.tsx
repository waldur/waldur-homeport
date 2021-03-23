import React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroupWithError } from '@waldur/marketplace/offerings/FormGroupWithError';

const componentMeasuredUnitValidator = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length > 30) {
    return translate('Ensure this field has no more than 30 characters.');
  }
};

export const ComponentMeasuredUnitField: React.FC = () => (
  <Field
    className="form-control"
    label={translate('Measured unit')}
    name="measured_unit"
    validate={componentMeasuredUnitValidator}
    component={FormGroupWithError}
  />
);

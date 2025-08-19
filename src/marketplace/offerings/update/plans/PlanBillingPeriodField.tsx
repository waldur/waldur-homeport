import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form/SelectField';

import { getBillingPeriods } from './constants';

export const PlanBillingPeriodField: FunctionComponent = () => (
  <Field
    name="unit"
    validate={required}
    component={SelectField as any}
    options={getBillingPeriods()}
    isClearable={false}
  />
);

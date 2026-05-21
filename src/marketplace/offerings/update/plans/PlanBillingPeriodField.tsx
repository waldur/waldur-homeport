import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectField } from '@/form/SelectField';

import { getBillingPeriods } from './constants';

export const PlanBillingPeriodField: FunctionComponent = () => (
  <Field
    name="unit"
    validate={required}
    component={SelectField}
    options={getBillingPeriods()}
    isClearable={false}
  />
);

import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/themed-select';

import { getBillingPeriods } from './constants';

export const PlanBillingPeriodField: FunctionComponent = () => (
  <Field
    name="unit"
    validate={required}
    component={(fieldProps) => (
      <Select
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        options={getBillingPeriods()}
        isClearable={false}
      />
    )}
  />
);

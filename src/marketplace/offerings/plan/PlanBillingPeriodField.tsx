import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';

import { getBillingPeriods } from './constants';

export const PlanBillingPeriodField = () => (
  <Field
    name="unit"
    validate={required}
    component={fieldProps => (
      <Select
        value={fieldProps.input.value}
        onChange={value => fieldProps.input.onChange(value)}
        options={getBillingPeriods()}
        clearable={false}
      />
    )}
  />
);

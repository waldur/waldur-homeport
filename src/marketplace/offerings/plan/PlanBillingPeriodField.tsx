import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';

import { getBillingPeriods } from './constants';

interface PlanBillingPeriodFieldProps {
  plan: string;
}

export const PlanBillingPeriodField = (props: PlanBillingPeriodFieldProps) => (
  <Field
    name={`${props.plan}.unit`}
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

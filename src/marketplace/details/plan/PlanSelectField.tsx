import { FunctionComponent } from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FieldError } from '@waldur/form';
import { Plan } from '@waldur/marketplace/types';

interface PlanSelectFieldProps {
  plans: Plan[];
}

export const PlanSelectField: FunctionComponent<PlanSelectFieldProps> = (
  props,
) => (
  <Field
    name="plan"
    validate={[required]}
    component={(fieldProps) => (
      <>
        <Select
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option) => option.url}
          getOptionLabel={(option) => option.name}
          options={props.plans}
          isClearable={false}
        />
        {fieldProps.meta.touched && (
          <FieldError error={fieldProps.meta.error} />
        )}
      </>
    )}
  />
);

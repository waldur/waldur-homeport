import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { BasePublicPlan } from 'waldur-js-client';

import { required } from '@/core/validators';
import { FieldError } from '@/form';
import { Select } from '@/form/themed-select';

interface PlanSelectFieldProps {
  plans: BasePublicPlan[];
  isLoading?: boolean;
  isDisabled?: boolean;
}

export const PlanSelectField: FunctionComponent<PlanSelectFieldProps> = (
  props,
) => {
  return (
    <Field
      name="plan"
      validate={required}
      component={(fieldProps) => (
        <>
          <Select
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: BasePublicPlan) => option.url}
            getOptionLabel={(option: BasePublicPlan) => option.name}
            options={props.plans}
            isClearable={false}
            isLoading={props.isLoading}
            isDisabled={props.isDisabled}
          />

          {fieldProps.meta.touched && (
            <FieldError error={fieldProps.meta.error} />
          )}
        </>
      )}
    />
  );
};

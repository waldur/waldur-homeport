import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { required } from '@/core/validators';
import { FieldError } from '@/form';
import { Select } from '@/form/select';

import { getPlanBillingMode } from './billingMode';
import { PlanBillingModeBadge } from './PlanBillingModeBadge';

interface PlanSelectFieldProps {
  plans: BasePublicPlan[];
  /** When given, each option shows how the plan bills next to its name. */
  offering?: Pick<PublicOfferingDetails, 'type' | 'components'>;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export const PlanSelectField: FunctionComponent<PlanSelectFieldProps> = (
  props,
) => {
  // The badge is there to tell plans apart. When every plan bills the same way
  // it repeats one word down the list and says nothing about the choice being
  // made -- these plans differ by size and price -- so it is left out until
  // there is something to distinguish.
  const distinctModes = new Set(
    (props.plans ?? []).map((plan) => getPlanBillingMode(props.offering, plan)),
  );
  const formatOptionLabel =
    props.offering && distinctModes.size > 1
      ? (plan: BasePublicPlan) => (
          <span className="d-inline-flex align-items-center gap-2">
            {plan.name}
            <PlanBillingModeBadge
              mode={getPlanBillingMode(props.offering, plan)}
            />
          </span>
        )
      : undefined;
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
            formatOptionLabel={formatOptionLabel}
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

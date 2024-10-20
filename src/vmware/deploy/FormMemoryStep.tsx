import { useMemo } from 'react';
import { Field } from 'redux-form';

import { FormGroup } from '@waldur/form';
import { SliderNumberField } from '@waldur/form/SliderNumberField';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  maxAmount,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

import { minOne, useVMwareLimitsLoader } from './utils';

export const FormMemoryStep = (props: FormStepProps) => {
  const { limits, isLoading } = useVMwareLimitsLoader(
    props.offering.scope_uuid,
  );

  const ramValidator = useMemo(
    () => (limits.max_ram ? [minOne, maxAmount(limits.max_ram)] : minOne),
    [limits.max_ram],
  );

  return (
    <VStepperFormStepCard
      title={translate('Memory')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      helpText={translate('Memory size in GiB')}
      loading={isLoading}
      disabled={props.disabled}
      required={props.required}
    >
      <Field
        name="limits.ram"
        component={FormGroup}
        min={1}
        validate={ramValidator}
        parse={parseIntField}
        format={formatIntField}
      >
        <SliderNumberField
          unit={translate('GB')}
          required={true}
          min={1}
          max={limits.max_ram}
        />
      </Field>
    </VStepperFormStepCard>
  );
};

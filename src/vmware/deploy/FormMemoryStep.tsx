import { useMemo } from 'react';
import { Field } from 'react-final-form';

import { composeValidators } from '@/core/validators';
import { FormGroup } from '@/form';
import { SliderNumberField } from '@/form/SliderNumberField';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import {
  formatIntField,
  maxAmount,
  parseIntField,
} from '@/marketplace/common/utils';
import { FormStepProps } from '@/marketplace/deploy/types';

import { minOne, useVMwareLimitsLoader } from './utils';

export const FormMemoryStep = (props: FormStepProps) => {
  const { limits, isLoading } = useVMwareLimitsLoader(
    props.offering.scope_uuid,
  );

  const ramValidator = useMemo(
    () =>
      limits.max_ram
        ? composeValidators(minOne, maxAmount(limits.max_ram))
        : minOne,
    [limits.max_ram],
  );

  return (
    <VStepperFormStepCard
      title={translate('Memory')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <Field
        name="limits.ram"
        component={FormGroup}
        min={1}
        validate={ramValidator}
        parse={parseIntField}
        format={formatIntField}
        tooltip={translate('Memory size in GiB')}
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

import { useMemo } from 'react';

import { composeValidators } from '@/core/validators';
import { SliderNumberGroup } from '@/form';
import { translate } from '@/i18n';
import {
  formatIntField,
  maxAmount,
  parseIntField,
} from '@/marketplace/common/utils';
import { FormStepProps } from '@/marketplace/deploy/types';
import { VStepperFormStepCard } from '@/wizard';

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
      <SliderNumberGroup
        name="limits.ram"
        min={1}
        validate={ramValidator}
        parse={parseIntField}
        format={formatIntField}
        tooltip={translate('Memory size in GiB')}
        unit={translate('GB')}
        required={true}
        max={limits.max_ram}
      />
    </VStepperFormStepCard>
  );
};

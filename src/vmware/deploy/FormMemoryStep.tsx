import { useMemo } from 'react';

import { StepCard } from 'waldur-ui';

import { composeValidators } from '@/core/validators';
import { SliderNumberGroup } from '@/form';
import { translate } from '@/i18n';
import {
  formatIntField,
  maxAmount,
  parseIntField,
} from '@/marketplace/common/utils';
import { FormStepProps } from '@/marketplace/deploy/types';

import { minOne, useVMwareLimitsLoader } from './utils';

export const FormMemoryStep = (props: FormStepProps) => {
  const { limits } = useVMwareLimitsLoader(props.offering.scope_uuid);

  const ramValidator = useMemo(
    () =>
      limits.max_ram
        ? composeValidators(minOne, maxAmount(limits.max_ram))
        : minOne,
    [limits.max_ram],
  );

  return (
    <StepCard
      title={translate('Memory')}
      id={props.id}
      disabled={props.disabled}
      disabledReason={props.disabledReason}
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
    </StepCard>
  );
};

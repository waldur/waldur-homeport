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

const coresPerSocketValidator = (coresPerSocket, values) => {
  const cores = values?.limits?.cpu || 1;
  if (cores % coresPerSocket !== 0) {
    return translate(
      'Number of CPU cores should be multiple of cores per socket.',
    );
  }
  return minOne(coresPerSocket);
};

export const FormProcessorStep = (props: FormStepProps) => {
  const { limits, isLoading } = useVMwareLimitsLoader(
    props.offering.scope_uuid,
  );

  const cpuValidator = useMemo(
    () =>
      limits.max_cpu
        ? composeValidators(minOne, maxAmount(limits.max_cpu))
        : minOne,
    [limits.max_cpu],
  );

  const coresPerSocketLimitValidator = useMemo(() => {
    const validators = [minOne, coresPerSocketValidator];
    if (limits.max_cores_per_socket) {
      validators.push(maxAmount(limits.max_cores_per_socket));
    }
    return composeValidators(...validators);
  }, [limits.max_cores_per_socket]);

  return (
    <VStepperFormStepCard
      title={translate('Processor')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <SliderNumberGroup
        name="limits.cpu"
        min={1}
        validate={cpuValidator}
        label={translate('Number of cores in a VM')}
        parse={parseIntField}
        format={formatIntField}
        unit={translate('Cores')}
        required={true}
        max={limits.max_cpu}
      />
      <SliderNumberGroup
        name="attributes.cores_per_socket"
        min={1}
        validate={coresPerSocketLimitValidator}
        label={translate('Number of CPU cores per socket')}
        parse={parseIntField}
        format={formatIntField}
        unit={translate('Cores')}
        required={true}
        max={limits.max_cores_per_socket || limits.max_cpu}
      />
    </VStepperFormStepCard>
  );
};

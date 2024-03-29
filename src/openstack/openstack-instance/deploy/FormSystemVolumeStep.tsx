import { useCallback, useEffect, useMemo } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormGroup, SelectField } from '@waldur/form';
import { SliderNumberField } from '@waldur/form/SliderNumberField';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';

import { getOfferingLimit, useQuotasData, useVolumeDataLoader } from './utils';

export const FormSystemVolumeStep = (props: FormStepProps) => {
  const { storageQuota, volumeTypeQuotas } = useQuotasData(props.offering);
  const { data, isLoading } = useVolumeDataLoader(props.offering);

  useEffect(() => {
    if (data?.defaultVolumeType) {
      props.change('attributes.system_volume_type', data.defaultVolumeType);
    }
  }, [data?.defaultVolumeType, props.change]);

  const limit = useMemo(
    () => getOfferingLimit(props.offering, 'storage', 10240 * 1024),
    [props?.offering],
  );

  const exceeds = useCallback(
    (value: number) => {
      return (value || 0) + (storageQuota.usage || 0) <= limit
        ? undefined
        : translate('Quota usage exceeds available limit.');
    },
    [limit],
  );

  return (
    <StepCard
      title={translate('System volume')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      helpText={translate('Non-detachable and non-resizable boot disk')}
      actions={
        <div className="d-flex justify-content-end flex-grow-1">
          <QuotaUsageBarChart
            className="capacity-bar"
            quotas={[storageQuota, ...volumeTypeQuotas]}
          />
        </div>
      }
      loading={isLoading}
    >
      {data?.volumeTypeChoices?.length > 0 && (
        <Field
          name="attributes.system_volume_type"
          component={FormGroup}
          validate={[required]}
          label={translate('System volume type')}
        >
          <SelectField options={data.volumeTypeChoices} required={true} />
        </Field>
      )}
      <Field
        name="attributes.system_volume_size"
        component={FormGroup}
        validate={[required, exceeds]}
        label={translate('Volume size')}
        format={(v) => (v ? v / 1024 : '')}
        normalize={(v) => Number(v) * 1024}
      >
        <SliderNumberField
          unit={translate('GB')}
          required={true}
          min={1}
          max={1 * 5120}
        />
      </Field>
    </StepCard>
  );
};

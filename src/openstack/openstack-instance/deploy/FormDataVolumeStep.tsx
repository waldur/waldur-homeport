import { useCallback, useEffect, useMemo, useState } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { FormGroup, SelectField } from '@waldur/form';
import { SliderNumberField } from '@waldur/form/SliderNumberField';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';

import { getOfferingLimit, useQuotasData, useVolumeDataLoader } from './utils';

export const FormDataVolumeStep = (props: FormStepProps) => {
  const [fieldsEnabled, setFieldsEnabled] = useState(false);
  const { storageQuota, volumeTypeQuotas } = useQuotasData(props.offering);
  const { data, isLoading } = useVolumeDataLoader(props.offering);

  useEffect(() => {
    if (data?.defaultVolumeType) {
      props.change('attributes.data_volume_type', data.defaultVolumeType);
    }
  }, [data?.defaultVolumeType, props.change]);

  const limit = useMemo(
    () => getOfferingLimit(props.offering, 'storage', 10240 * 1024),
    [props?.offering],
  );

  const exceeds = useCallback(
    (value: number) => {
      if (!fieldsEnabled) return undefined;
      return (value || 0) + (storageQuota.usage || 0) <= limit
        ? undefined
        : translate('Quota usage exceeds available limit.');
    },
    [limit, fieldsEnabled],
  );

  return (
    <StepCard
      title={translate('Data volume')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      helpText={translate('Detachable and resizable data disk')}
      actions={
        <div className="d-flex justify-content-between flex-grow-1">
          <AwesomeCheckbox value={fieldsEnabled} onChange={setFieldsEnabled} />
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
          name="attributes.data_volume_type"
          component={FormGroup}
          label={translate('Data volume type')}
        >
          <SelectField
            options={data.volumeTypeChoices}
            required={true}
            isDisabled={!fieldsEnabled}
          />
        </Field>
      )}
      <Field
        name="attributes.data_volume_size"
        component={FormGroup}
        validate={[exceeds]}
        label={translate('Volume size')}
        disabled={!fieldsEnabled}
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

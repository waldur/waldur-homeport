import { useCallback, useEffect, useMemo } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormGroup, SelectField } from '@waldur/form';
import { SliderNumberField } from '@waldur/form/SliderNumberField';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import {
  getOfferingLimit,
  useVolumeDataLoader,
} from '@waldur/openstack/openstack-instance/deploy/utils';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';

import { useQuotasData } from './utils';

export const FormVolumeStep = (props: FormStepProps) => {
  const { storageQuota, volumeTypeQuotas } = useQuotasData(props.offering);
  const { data, isLoading } = useVolumeDataLoader(props.offering);

  useEffect(() => {
    if (data?.defaultVolumeType) {
      props.change('attributes.type', data.defaultVolumeType);
    }
  }, [data?.defaultVolumeType, props.change]);

  const limit = useMemo(
    () => getOfferingLimit(props.offering, 'storage', 10240 * 1024),
    [props?.offering],
  );

  const exceeds = useCallback(
    (value: number) => {
      return (value || 0) <= limit
        ? undefined
        : translate('Quota usage exceeds available limit.');
    },
    [limit],
  );

  return (
    <StepCard
      title={translate('Volume')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
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
          name="attributes.type"
          component={FormGroup}
          label={translate('Volume type')}
          validate={[required]}
        >
          <SelectField options={data.volumeTypeChoices} />
        </Field>
      )}
      <Field
        name="attributes.size"
        component={FormGroup}
        label={translate('Volume size')}
        validate={[required, exceeds]}
        format={(v) => (v ? v / 1024 : '')}
        normalize={(v) => Number(v) * 1024}
      >
        <SliderNumberField unit={translate('GB')} min={1} max={1 * 10240} />
      </Field>
    </StepCard>
  );
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Field, formValueSelector } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { required } from '@waldur/core/validators';
import { FormGroup, SelectField } from '@waldur/form';
import { SliderNumberField } from '@waldur/form/SliderNumberField';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';

import { VolumeTypeChoice } from '../utils';

import { getOfferingLimit, useQuotasData, useVolumeDataLoader } from './utils';

const DEFAULT_STORAGE_LIMIT_MB = 10240 * 1024;

export const FormAbstractVolumeStep = (
  props: FormStepProps & { typeField; sizeField; title; helpText; optional },
) => {
  const [fieldsEnabled, setFieldsEnabled] = useState(!props.optional);
  const { quotas } = useQuotasData(props.offering);
  const { data, isLoading } = useVolumeDataLoader(props.offering);

  const volumeType: VolumeTypeChoice = useSelector((state) =>
    formValueSelector(FORM_ID)(state, props.typeField),
  );

  const { change } = props;

  useEffect(() => {
    if (data?.defaultVolumeType) {
      change(props.typeField, data.defaultVolumeType);
    }
  }, [data?.defaultVolumeType, change, props.typeField]);

  const quotaName = volumeType ? `gigabytes_${volumeType.name}` : 'storage';

  const quota = useMemo(
    () => quotas.find((quota) => quota.name === quotaName),
    [quotas, quotaName],
  );

  const usage = quota?.usage || 0;

  const limit = useMemo(
    () => getOfferingLimit(props.offering, quotaName, DEFAULT_STORAGE_LIMIT_MB),
    [props?.offering, quotaName],
  );

  const exceeds = useCallback(
    (value: number) => {
      if (limit === -1) {
        return;
      }
      if ((value || 0) + (usage || 0) > limit) {
        return translate('Quota usage exceeds available limit.');
      }
    },
    [limit, usage],
  );

  return (
    <VStepperFormStepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
      helpText={props.helpText}
      actions={
        <div className="d-flex justify-content-end flex-grow-1">
          {props.optional && (
            <AwesomeCheckbox
              value={fieldsEnabled}
              onChange={setFieldsEnabled}
            />
          )}
          {quota && (
            <QuotaUsageBarChart className="capacity-bar" quotas={[quota]} />
          )}
        </div>
      }
      loading={isLoading}
    >
      {data?.volumeTypeChoices?.length > 0 && (
        <Field
          name={props.typeField}
          component={FormGroup}
          validate={props.optional ? undefined : [required]}
          label={props.title}
          required
        >
          <SelectField
            options={data.volumeTypeChoices}
            required={true}
            isDisabled={!fieldsEnabled}
          />
        </Field>
      )}
      <Field
        name={props.sizeField}
        component={FormGroup}
        validate={!fieldsEnabled ? undefined : [required, exceeds]}
        label={translate('Volume size')}
        format={(v) => (v ? v / 1024 : '')}
        normalize={(v) => Number(v) * 1024}
        required
      >
        <SliderNumberField
          unit={translate('GB')}
          required={true}
          min={1}
          max={1 * 5120}
        />
      </Field>
    </VStepperFormStepCard>
  );
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { OpenstackFeatures } from '@waldur/FeaturesEnums';
import { FormGroup, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { orderFormSelector } from '@waldur/marketplace/deploy/selectors';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';

import { VolumeTypeChoice } from '../utils';

import { getOfferingLimit, useQuotasData, useVolumeDataLoader } from './utils';

const DEFAULT_STORAGE_LIMIT_MB = 10240 * 1024;

const defaultSizeOptions = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
];

const formatVolumeSize = (v) => (v ? v / 1024 : '');

export const FormAbstractVolumeFields = (
  props: FormStepProps & {
    typeField;
    sizeField;
    title;
    helpText?;
    optional;
    minSize?: number;
  },
) => {
  const [fieldsEnabled, setFieldsEnabled] = useState(!props.optional);
  const { quotas } = useQuotasData(props.offering);
  const { data, isLoading } = useVolumeDataLoader(props.offering);

  const volumeType: VolumeTypeChoice = useSelector((state) =>
    orderFormSelector(state, props.typeField),
  );
  const volumeSize: number = useSelector((state) =>
    orderFormSelector(state, props.sizeField),
  );

  const extendedSizeOptions = useMemo(() => {
    const options = [...defaultSizeOptions];
    [props.minSize, volumeSize].forEach((size) => {
      const formattedSize = formatVolumeSize(size);
      const exists = options.find((opt) => opt.value === formattedSize);
      if (formattedSize && !exists) {
        options.push({ label: String(formattedSize), value: formattedSize });
      }
    });
    return options;
  }, [props.minSize, volumeSize]);

  const hideVolumeTypeSelector = isFeatureVisible(
    OpenstackFeatures.hide_volume_type_selector,
  );

  const { change } = props;

  useEffect(() => {
    if (hideVolumeTypeSelector) {
      return;
    }
    if (volumeType) {
      return;
    }
    if (data?.defaultVolumeType) {
      change(props.typeField, data.defaultVolumeType);
    } else if (data?.volumeTypeChoices?.length === 1) {
      change(props.typeField, data.volumeTypeChoices[0]);
    }
  }, [data, change, props.typeField, hideVolumeTypeSelector, volumeType]);

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
      if (props.minSize && props.minSize > 0 && value < props.minSize) {
        return translate(
          'Volume size is not enough for minimum disk of flavor and image. (min disk: {value} GB)',
          { value: formatVolumeSize(props.minSize) },
        );
      }
      if (limit === -1) {
        return;
      }
      if (quotaName !== 'storage') {
        value = value / 1024;
      }
      if ((value || 0) + (usage || 0) > limit) {
        return translate('Quota usage exceeds available limit.');
      }
    },
    [limit, usage, quotaName, props.minSize],
  );

  return (
    <Row>
      {data?.volumeTypeChoices?.length > 0 && !hideVolumeTypeSelector && (
        <Col sm={6}>
          <Field
            name={props.typeField}
            component={FormGroup}
            validate={props.optional ? undefined : [required]}
            label={props.title}
            required={!props.optional}
            space={5}
            tooltip={props.helpText}
            tooltipEnd
            quickAction={
              props.optional && (
                <AwesomeCheckbox
                  value={fieldsEnabled}
                  onChange={setFieldsEnabled}
                  size="sm"
                  className="align-self-center"
                />
              )
            }
          >
            <SelectField
              options={data.volumeTypeChoices}
              isDisabled={!fieldsEnabled}
              isLoading={isLoading}
            />
          </Field>
        </Col>
      )}
      <Col xs>
        <Field
          name={props.sizeField}
          component={FormGroup}
          validate={!fieldsEnabled ? undefined : [required, exceeds]}
          label={translate('Volume size') + ' (GB)'}
          format={formatVolumeSize}
          normalize={(v) => Number(v) * 1024}
          required
          space={5}
          quickAction={
            quota && (
              <QuotaUsageBarChart
                className="capacity-bar mb-2"
                quotas={[quota]}
              />
            )
          }
        >
          <SelectField
            creatable
            simpleValue
            options={extendedSizeOptions}
            isDisabled={!fieldsEnabled}
          />
        </Field>
      </Col>
    </Row>
  );
};

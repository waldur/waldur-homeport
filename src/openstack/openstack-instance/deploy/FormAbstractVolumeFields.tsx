import classNames from 'classnames';
import { get } from 'lodash-es';
import { useCallback, useEffect, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-final-form';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { OpenstackFeatures } from '@/FeaturesEnums';
import { CreatableSelectGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { FormStepProps } from '@/marketplace/deploy/types';
import { Quota } from '@/openstack/types';
import { QuotaUsageBarChart } from '@/quotas/QuotaUsageBarChart';

import { VolumeTypeChoice } from '../utils';

import { useQuotasData, useVolumeDataLoader } from './utils';

const defaultSizeOptions = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
];

const formatVolumeSize = (v) => (v ? v / 1024 : '');

// A quota only constrains anything when it carries a limit: the backend sends
// -1 for one that was never set, and the 'storage' entry getQuotas always
// synthesizes is undefined when the offering has no such quota. Neither has
// anything to measure against.
const getLimitedQuota = (quotas: Quota[], name: string) => {
  const quota = quotas.find((quota) => quota.name === name);
  return quota != null && quota.limit != null && quota.limit !== -1
    ? quota
    : undefined;
};

const hasLimit = (quotas: Quota[], name: string) =>
  getLimitedQuota(quotas, name) != null;

// A volume type has a quota of its own only when the offering tracks storage
// per type. When it has a single storage component, that common quota covers
// every type, so picking a type must not take the quota off the screen.
const getVolumeQuotaName = (quotas: Quota[], volumeType?: VolumeTypeChoice) => {
  if (!volumeType) {
    return 'storage';
  }
  const volumeTypeQuota = `gigabytes_${volumeType.name}`;
  if (hasLimit(quotas, volumeTypeQuota) || !hasLimit(quotas, 'storage')) {
    return volumeTypeQuota;
  }
  return 'storage';
};

// A type whose own quota is used up cannot be ordered at any size. A type
// without a quota of its own draws from the common one, which the size
// validation already measures, so it is never ruled out here.
const isVolumeTypeExhausted = (
  quotas: Quota[],
  volumeType: VolumeTypeChoice,
) => {
  const quota = getLimitedQuota(quotas, `gigabytes_${volumeType.name}`);
  return quota != null && (quota.usage || 0) >= quota.limit;
};

interface RequestedVolume {
  type?: VolumeTypeChoice;
  // In MB, as the form keeps it.
  size: number;
}

// Charges the volumes of an order the way the backend does: every volume
// draws from the common storage quota (MB), and also from its own type's
// quota (GB) when there is one. Only the quotas the given type draws from are
// checked, so each field reports the limits it can do something about.
const exceedsVolumeQuotas = (
  quotas: Quota[],
  volumes: RequestedVolume[],
  volumeType?: VolumeTypeChoice,
) => {
  const exceeds = (name: string, requested: number) => {
    const quota = getLimitedQuota(quotas, name);
    return quota != null && requested + (quota.usage || 0) > quota.limit;
  };
  const sum = (sizes: RequestedVolume[]) =>
    sizes.reduce((total, volume) => total + (volume.size || 0), 0);

  if (exceeds('storage', sum(volumes))) {
    return true;
  }
  if (!volumeType) {
    return false;
  }
  const sameType = volumes.filter(
    (volume) => volume.type?.name === volumeType.name,
  );
  return exceeds(`gigabytes_${volumeType.name}`, sum(sameType) / 1024);
};

interface VolumeFieldNames {
  typeField: string;
  sizeField: string;
}

export const FormAbstractVolumeFields = (
  props: FormStepProps & {
    typeField;
    sizeField;
    typeTitle;
    sizeTitle;
    helpText?;
    optional?;
    minSize?: number;
    hideQuotas?: boolean;
    // Other volumes of the same order: they draw from the same quotas, so
    // their sizes count towards this volume's limits.
    siblingVolumes?: VolumeFieldNames[];
  },
) => {
  const { quotas } = useQuotasData(props.offering);
  const { data, isLoading } = useVolumeDataLoader(props.offering);

  const formData = useOrderFormData();
  const volumeType: VolumeTypeChoice = get(formData, props.typeField);
  const volumeSize: number = get(formData, props.sizeField);

  // An optional volume keeps its toggle among the form values, not in local
  // state: toggling it then revalidates the form, and a step that mounts again
  // finds it as it was left. Until it is set, a size in the form means the
  // volume is going to be ordered, so it counts as switched on. The order
  // serializers pick their fields by name, so the flag never reaches an order.
  const enabledField = `${props.sizeField}_enabled`;
  const isEnabled = useCallback(
    (values: object) =>
      !props.optional ||
      (get(values, enabledField) ?? Boolean(get(values, props.sizeField))),
    [props.optional, enabledField, props.sizeField],
  );
  const fieldsEnabled = isEnabled(formData);

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

  const { batch, change } = useForm();

  // A disabled field still keeps its value, and the order is built from the
  // values alone: switching an optional volume off has to drop its size, or
  // the volume is ordered all the same. The type alone creates nothing.
  const toggleFields = useCallback(
    (enabled: boolean) =>
      batch(() => {
        change(enabledField, enabled);
        if (!enabled) {
          change(props.sizeField, undefined);
        }
      }),
    [batch, change, enabledField, props.sizeField],
  );

  const volumeTypeOptions = useMemo(
    () =>
      (data?.volumeTypeChoices || []).map(
        (choice): VolumeTypeChoice & { isDisabled: boolean } => {
          const isDisabled = isVolumeTypeExhausted(quotas, choice);
          return {
            ...choice,
            label: isDisabled
              ? translate('{name} (quota exhausted)', { name: choice.label })
              : choice.label,
            isDisabled,
          };
        },
      ),
    [data, quotas],
  );

  useEffect(() => {
    if (hideVolumeTypeSelector) {
      return;
    }
    if (volumeType) {
      return;
    }
    const available = volumeTypeOptions.filter((option) => !option.isDisabled);
    const defaultVolumeType =
      available.find(
        (option) => option.value === data?.defaultVolumeType?.value,
      ) || available[0];
    if (defaultVolumeType) {
      change(props.typeField, defaultVolumeType);
    }
  }, [
    data,
    volumeTypeOptions,
    change,
    props.typeField,
    hideVolumeTypeSelector,
    volumeType,
  ]);

  const quotaName = useMemo(
    () => getVolumeQuotaName(quotas, volumeType),
    [quotas, volumeType],
  );

  const quota = useMemo(
    () => quotas.find((quota) => quota.name === quotaName),
    [quotas, quotaName],
  );

  // Everything that can change while the form is filled in is read from the
  // values being validated: react-final-form hands a field its new validator
  // only after rendering, so the validation a change of type triggers would
  // otherwise still measure against the previous type's quota.
  const validateSize = useCallback(
    (value: number, allValues: object = {}) => {
      if (!isEnabled(allValues)) {
        return;
      }
      const missing = required(value);
      if (missing) {
        return missing;
      }
      if (props.minSize && props.minSize > 0 && value < props.minSize) {
        return translate(
          'Volume size is not enough for minimum disk of flavor and image. (min disk: {value} GB)',
          { value: formatVolumeSize(props.minSize) },
        );
      }
      const volumes: RequestedVolume[] = [
        { type: get(allValues, props.typeField), size: value },
        ...(props.siblingVolumes || []).map((sibling) => ({
          type: get(allValues, sibling.typeField),
          size: get(allValues, sibling.sizeField),
        })),
      ];
      if (
        exceedsVolumeQuotas(quotas, volumes, get(allValues, props.typeField))
      ) {
        return translate('Quota usage exceeds available limit.');
      }
    },
    [isEnabled, quotas, props.minSize, props.typeField, props.siblingVolumes],
  );

  const showTypeField =
    data?.volumeTypeChoices?.length > 0 && !hideVolumeTypeSelector;

  return (
    <Row>
      {showTypeField && (
        <Col sm={6}>
          <SelectGroup
            name={props.typeField}
            validate={props.optional ? undefined : required}
            label={props.typeTitle}
            required={!props.optional}
            space={5}
            tooltip={props.helpText}
            tooltipEnd
            quickAction={
              props.optional && (
                <AwesomeCheckbox
                  value={fieldsEnabled}
                  onChange={toggleFields}
                  size="sm"
                  className="align-self-center"
                />
              )
            }
            options={volumeTypeOptions}
            isDisabled={!fieldsEnabled}
            isLoading={isLoading}
          />
        </Col>
      )}
      <Col xs>
        <CreatableSelectGroup
          name={props.sizeField}
          label={props.sizeTitle}
          required
          space={5}
          quickAction={
            <>
              {!showTypeField && props.optional && (
                <AwesomeCheckbox
                  value={fieldsEnabled}
                  onChange={toggleFields}
                  size="sm"
                  className="align-self-center ms-auto"
                />
              )}
              {!props.hideQuotas && quota && (
                <QuotaUsageBarChart
                  className={classNames(
                    'capacity-bar mb-2',
                    !showTypeField && props.optional && 'ms-4',
                  )}
                  quotas={[quota]}
                />
              )}
            </>
          }
          validate={validateSize}
          format={formatVolumeSize}
          parse={(v: any) => Number(v) * 1024}
          simpleValue
          options={extendedSizeOptions}
          isDisabled={!fieldsEnabled}
        />
      </Col>
    </Row>
  );
};

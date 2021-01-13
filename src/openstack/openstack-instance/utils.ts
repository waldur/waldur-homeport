import { translate } from '@waldur/i18n';
import { formatFlavor } from '@waldur/resource/utils';

import { VolumeType } from '../types';

import { Flavor } from './types';

export const validateAndSort = (formData, choices, validator, comparator) =>
  choices
    .map((choice) => ({
      ...choice,
      disabled: validator(formData, choice),
    }))
    .sort(comparator);

export const formatFlavorTitle = (flavor) => {
  const props = formatFlavor(flavor);
  return `${flavor.name} (${props})`;
};

export const getMinSystemVolumeSize = (formData) => {
  const imageMinValue = formData.image ? formData.image.min_disk : 0;
  const flavorMinValue = formData.flavor ? formData.flavor.disk : 0;
  return Math.max(imageMinValue, flavorMinValue);
};

export const calculateSystemVolumeSize = (formData) => {
  const minValue = getMinSystemVolumeSize(formData);
  const currentValue = formData.system_volume_size || 0;
  return Math.max(currentValue, minValue);
};

export const formatVolumeTypeChoices = (volumeTypes: VolumeType[]): any[] =>
  volumeTypes.map((volumeType) => ({
    label: volumeType.description
      ? `${volumeType.name} (${volumeType.description})`
      : volumeType.name,
    value: volumeType.url,
    name: volumeType.name,
    is_default: volumeType.is_default,
  }));

export const getDefaultVolumeType = (volumeTypes) =>
  volumeTypes.find((volumeType) => volumeType.is_default);

const DNS_LABEL_REGEX = new RegExp('^([a-zA-Z0-9-]{1,63})$');

const NUMBER_REGEX = new RegExp('^[0-9]+$');

const MAX_NAME_LENGTH = 255;

export const validateOpenstackInstanceName = (name: string) => {
  // Translated to JS from https://github.com/openstack/neutron-lib/blob/master/neutron_lib/api/validators/dns.py#L23
  // NOTE: An individual name regex instead of an entire FQDN was used
  // because its easier to make correct. The logic should validate that the
  // dns_name matches RFC 1123 (section 2.1) and RFC 952.

  // A trailing period is allowed to indicate that a name is fully
  // qualified per RFC 1034 (page 7).
  const trimmed = name.endsWith('.') ? name.slice(0, -1) : name;
  if (trimmed.length > MAX_NAME_LENGTH) {
    return translate('"{trimmed}" exceeds the {max_len} character FQDN limit', {
      trimmed,
      max_len: MAX_NAME_LENGTH,
    });
  }

  const labels = trimmed.split('.');

  for (const label of labels) {
    if (!label) {
      return translate('Encountered an empty component');
    }

    if (label.endsWith('-') || label.startsWith('-')) {
      return translate('Name "{label}" must not start or end with a hyphen', {
        label,
      });
    }

    if (!DNS_LABEL_REGEX.test(label)) {
      return translate(
        'Name "{label}" must be 1-63 characters long, each of which can only be alphanumeric or a hyphen',
        { label },
      );
    }
  }

  // RFC 1123 hints that a TLD can't be all numeric. last is a TLD if
  // it's an FQDN.
  const tld = labels[labels.length - 1];
  if (labels.length > 1 && NUMBER_REGEX.test(tld)) {
    return translate('TLD "{tld}" must not be all numeric', { tld });
  }
};

export const getVolumeTypeRequirements = (formData) => {
  const required = {};
  if (formData.data_volume_type) {
    const key = `gigabytes_${formData.data_volume_type.name}`;
    required[key] = (required[key] || 0) + formData.data_volume_size / 1024.0;
  }
  if (formData.system_volume_type) {
    const key = `gigabytes_${formData.system_volume_type.name}`;
    required[key] = (required[key] || 0) + formData.system_volume_size / 1024.0;
  }
  return required;
};

export function formatSubnet(subnet) {
  return `${subnet.name} (${subnet.cidr})`;
}

export function flavorComparator(a: Flavor, b: Flavor) {
  if (a.disabled < b.disabled) return -1;
  if (a.disabled > b.disabled) return 1;

  if (a.cores > b.cores) return 1;
  if (a.cores < b.cores) return -1;

  if (a.ram > b.ram) return 1;
  if (a.ram < b.ram) return -1;

  if (a.disk > b.disk) return 1;
  if (a.disk < b.disk) return -1;
  return 0;
}

export function flavorValidator(model, choice) {
  if (!model.image) {
    return true;
  }
  if (model.image.min_ram > choice.ram) {
    return true;
  }
  return false;
}

import { translate } from '@waldur/i18n';
import { Port } from '@waldur/resource/types';
import { formatFlavor } from '@waldur/resource/utils';

import { Quota, VolumeType } from '../types';

import { FloatingIp } from './types';

const getTotalStorage = (formData) =>
  (formData.system_volume_size || 0) + (formData.data_volume_size || 0);

function extendVolumeTypeQuotas(formData, usages, limits) {
  const quotas = [];
  const required = getVolumeTypeRequirements(formData);
  Object.keys(limits)
    .filter((key) => key.startsWith('gigabytes_'))
    .forEach((key) => {
      quotas.push({
        name: key,
        usage: usages[key] || 0,
        limit: limits[key],
        required: required[key] || 0,
      });
    });
  return quotas;
}

export const formatFlavorTitle = (flavor) => {
  const props = formatFlavor(flavor);
  return `${flavor.name} (${props})`;
};

const getMinSystemVolumeSize = (formData) => {
  const imageMinValue = formData.image ? formData.image.min_disk : 0;
  const flavorMinValue = formData.flavor ? formData.flavor.disk : 0;
  return Math.max(imageMinValue, flavorMinValue);
};

export const calculateSystemVolumeSize = (formData) => {
  const minValue = getMinSystemVolumeSize(formData);
  const currentValue = formData.system_volume_size || 0;
  return Math.max(currentValue, minValue);
};

export const formatVolumeTypeLabel = (volumeType: VolumeType): string =>
  volumeType.description
    ? `${volumeType.name} (${volumeType.description})`
    : volumeType.name;

export const formatVolumeTypeChoices = (volumeTypes: VolumeType[]) =>
  volumeTypes.map((volumeType) => ({
    label: formatVolumeTypeLabel(volumeType),
    value: volumeType.url,
    name: volumeType.name,
    is_default: volumeType.is_default,
  }));

export type VolumeTypeChoice = ReturnType<typeof formatVolumeTypeChoices>[0];

export const getDefaultVolumeType = (volumeTypes: VolumeTypeChoice[]) =>
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

const getVolumeTypeRequirements = (formData) => {
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

export function flavorValidator(model, choice) {
  if (!model.image) {
    return true;
  }
  if (model.image.min_ram > choice.ram) {
    return true;
  }
  return false;
}

export const formatAddressList = (row: Port) =>
  row.fixed_ips.map((fip) => fip.ip_address).join(', ') || 'N/A';

export const getQuotas = ({ formData, usages, limits }) => {
  const quotas: Quota[] = [
    {
      name: 'vcpu',
      usage: usages.cores,
      limit: limits.cores,
      required: formData.flavor ? formData.flavor.cores : 0,
    },
    {
      name: 'ram',
      usage: usages.ram,
      limit: limits.ram,
      required: formData.flavor ? formData.flavor.ram : 0,
    },
    {
      name: 'storage',
      usage: usages.disk,
      limit: limits.disk,
      required: getTotalStorage(formData) || 0,
    },
    ...extendVolumeTypeQuotas(formData, usages, limits),
  ];
  return quotas;
};

export const getDefaultFloatingIps = () =>
  [
    {
      address: translate('Skip floating IP assignment'),
      url: 'false',
    },
    {
      address: translate('Auto-assign floating IP'),
      url: 'true',
    },
  ] as FloatingIp[];

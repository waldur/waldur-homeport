import { OpenStackNestedPort, OpenStackVolumeType } from 'waldur-js-client';
import { OpenStackFloatingIp } from 'waldur-js-client';

import { translate } from '@/i18n';
import { formatFlavor } from '@/resource/utils';
import { renderFieldOrDash } from '@/table/utils';

import { Quota } from '../types';

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

export const formatVolumeTypeLabel = (
  volumeType: OpenStackVolumeType,
): string =>
  volumeType.description
    ? `${volumeType.name} (${volumeType.description})`
    : volumeType.name;

export const formatVolumeTypeChoices = (volumeTypes: OpenStackVolumeType[]) =>
  volumeTypes.map((volumeType) => ({
    label: formatVolumeTypeLabel(volumeType),
    value: volumeType.url,
    name: volumeType.name,
  }));

export type VolumeTypeChoice = ReturnType<typeof formatVolumeTypeChoices>[0];

export const getDefaultVolumeType = (volumeTypes: VolumeTypeChoice[]) =>
  volumeTypes[0];

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
  return model.image.min_ram > choice.ram;
}

export const formatAddressList = (
  row: Pick<OpenStackNestedPort, 'fixed_ips'>,
) =>
  renderFieldOrDash(
    row.fixed_ips?.map((fip) => fip.ip_address).join(', ') || null,
  );

const countAutoAssignFips = (attributes) => {
  if (!attributes.networks || !Array.isArray(attributes.networks)) return 0;
  return attributes.networks.filter((row) => row?.floatingIp?.url === 'true')
    .length;
};

export const getQuotas = ({ attributes, usages, limits }) => {
  const quotas: Quota[] = [
    {
      name: 'vcpu',
      usage: usages.cores,
      limit: limits.cores,
      required: attributes.flavor ? attributes.flavor.cores : 0,
    },
    {
      name: 'ram',
      usage: usages.ram,
      limit: limits.ram,
      required: attributes.flavor ? attributes.flavor.ram : 0,
    },
    {
      name: 'storage',
      usage: usages.disk,
      limit: limits.disk,
      required: getTotalStorage(attributes) || 0,
    },
    {
      name: 'instances',
      usage: usages.instances,
      limit: limits.instances,
      required: 1,
    },
    {
      name: 'floating_ip_count',
      usage: usages.floating_ip_count,
      limit: limits.floating_ip_count,
      required: countAutoAssignFips(attributes),
    },
    ...extendVolumeTypeQuotas(attributes, usages, limits),
  ];
  return quotas;
};

export const getDefaultFloatingIps = (opts?: { fipQuotaExhausted?: boolean }) =>
  [
    {
      address: translate('Skip floating IP assignment'),
      url: 'false',
    },
    {
      address: translate('Auto-assign floating IP'),
      url: 'true',
      ...(opts?.fipQuotaExhausted
        ? {
            isDisabled: true,
            disabledReason: translate(
              'Floating IP quota is exhausted; ask the administrator to raise the limit',
            ),
          }
        : {}),
    },
  ] as OpenStackFloatingIp[];

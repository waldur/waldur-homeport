import { translate } from '@waldur/i18n';
import { QUOTA_NAMES_MAPPING, QUOTA_SPL_TYPE, QUOTA_PACKAGE_TYPE } from '@waldur/quotas/constants';

import { listToDict } from '../core/utils';

const quotaNames = {
  storage: 'disk',
  vcpu: 'cores',
};

const parseQuotaName = name => quotaNames[name] || name;

export const parseQuotas = listToDict(
  item => parseQuotaName(item.name),
  item => item.limit
);

export const parseQuotasUsage = listToDict(
  item => parseQuotaName(item.name),
  item => item.usage
);

export const aggregateQuotasFromSPL = (components, quotas) => {
  components.limitsType = {};
  quotas.forEach(quota => {
    const componentQuotaName = QUOTA_NAMES_MAPPING[quota.name];
    if (quota.limit !== -1) {
      if (quota.limit < components.limits[componentQuotaName]) {
        components.limits[componentQuotaName] = quota.limit;
        components.limitsType[componentQuotaName] = QUOTA_SPL_TYPE;
      } else {
        components.limits[componentQuotaName] = components.limits[componentQuotaName];
        components.limitsType[componentQuotaName] = QUOTA_PACKAGE_TYPE;
      }
    } else {
      components.limitsType[componentQuotaName] = QUOTA_PACKAGE_TYPE;
    }
    components.usages[componentQuotaName] = Math.max(quota.usage, components.usages[componentQuotaName]);
  });
  return components;
};

const PRIVATE_CIDR_PATTERN = new RegExp(
  // Class A
  '(^(10)(\.([2]([0-5][0-5]|[01234][6-9])|[1][0-9][0-9]|[1-9][0-9]|[0-9])){2}\.0/24$)' +
  // Class B
  '|(^(172)\.(1[6-9]|2[0-9]|3[0-1])(\.(2[0-4][0-9]|25[0-5]|[1][0-9][0-9]|[1-9][0-9]|[0-9]))\.0/24$)' +
  // Class C
  '|(^(192)\.(168)(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9]))\.0/24$)'
);

export const validatePrivateSubnetCIDR = value => {
  if (!value) {
    return;
  }
  if (!value.match(PRIVATE_CIDR_PATTERN)) {
    return translate('Enter a valid IPv4 address.');
  }
};

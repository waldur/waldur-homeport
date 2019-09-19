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

export const extractSubnet = value => {
  if (value) {
    return value.split('.')[2];
  }
  return '';
};

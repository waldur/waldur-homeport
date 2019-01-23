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

export const parseComponents = listToDict(
  item => parseQuotaName(item.type),
  item => item.amount
);

export const parsePrices = listToDict(
  item => parseQuotaName(item.type),
  item => parseFloat(item.price)
);

export function templateParser(template) {
  /* Output is item with the following format:
  {
    "url": "https://example.com/api/package-templates/2/",
    "name": "Minimal VPC package",
    "dailyPrice": 1,
    "monthlyPrice": 30,
    "annualPrice": 365
    "ram": 20240,
    "cores": 20,
    "disk": 51200,
  }
  */
  const components = parseComponents(template.components);
  const dailyPrice = parseFloat(template.price);
  return {
    ...template,
    dailyPrice,
    monthlyPrice: dailyPrice * 30,
    annualPrice: dailyPrice * 365,
  ...components,
  };
}

export function getTenantTemplate(tenant) {
  if (!tenant.extra_configuration.package_category) {
    return;
  }
  const quotas = parseQuotas(tenant.quotas);
  return {
    name: tenant.extra_configuration.package_name,
    category: tenant.extra_configuration.package_category,
    ...quotas,
  };
}

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

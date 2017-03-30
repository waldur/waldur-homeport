import { listToDict } from '../core/utils';

const quotaNames = {
  storage: 'disk',
  vcpu: 'cores',
};

const parseQuotaName = name => quotaNames[name] || name;

const parseQuotas = listToDict(
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
  return angular.extend({}, template, {
    dailyPrice: dailyPrice,
    monthlyPrice: dailyPrice * 30,
    annualPrice: dailyPrice * 365,
  }, components);
}

export function getTenantTemplate(tenant) {
  if (!tenant.extra_configuration.package_category) {
    return;
  }
  const quotas = parseQuotas(tenant.quotas);
  return angular.extend({
    name: tenant.extra_configuration.package_name,
    category: tenant.extra_configuration.package_category,
  }, quotas);
}

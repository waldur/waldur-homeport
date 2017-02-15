export const openstackTemplateColumns = [
  {
    name: 'name',
    label: 'VPC package'
  },
  {
    name: 'category',
    label: 'Category',
    filter: 'translate'
  },
  {
    name: 'cores',
    label: 'Max vCPU'
  },
  {
    name: 'ram',
    label: 'Max RAM',
    filter: 'filesize'
  },
  {
    name: 'storage',
    label: 'Max storage',
    filter: 'filesize'
  },
  {
    name: 'dailyPrice',
    label: '1 day',
    filter: 'defaultCurrency'
  },
  {
    name: 'monthlyPrice',
    label: '1 month',
    filter: 'defaultCurrency'
  },
  {
    name: 'annualPrice',
    label: '1 year',
    filter: 'defaultCurrency'
  }
];

export const TEMPLATE_CATEGORIES = ['Trial', 'Small', 'Medium', 'Large'];

export const openstackTemplateFilters = {
  name: 'category',
  choices: [
    {
      value: '',
      label: 'All categories'
    },
    ...TEMPLATE_CATEGORIES.map(category => ({
      value: category,
      label: category
    }))
  ],
  defaultValue: '',
};

export function templateComparator(a, b) {
  const category1 = TEMPLATE_CATEGORIES.indexOf(a.category);
  const category2 = TEMPLATE_CATEGORIES.indexOf(b.category);

  if (category1 < category2) return -1;
  if (category1 > category2) return 1;

  if (a.monthlyPrice < b.monthlyPrice) return -1;
  if (a.monthlyPrice > b.monthlyPrice) return 1;

  const name1 = a.name.toUpperCase();
  const name2 = b.name.toUpperCase();

  return name1.localeCompare(name2);
}

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
    "storage": 51200,
  }
  */
  const components = template.components.reduce((map, item) => {
    map[item.type] = item.amount;
    return map;
  }, {});
  const dailyPrice = template.price;
  return angular.extend({}, template, {
    dailyPrice: dailyPrice,
    monthlyPrice: dailyPrice * 30,
    annualPrice: dailyPrice * 365
  }, components);
}

export function templateFormatter($filter, value) {
  const ram = $filter('filesize')(value.ram);
  const storage = $filter('filesize')(value.storage);
  const props = `${value.cores} vCPU, ${ram} RAM, ${storage} storage`;
  return `${value.name} / ${value.category} (${props})`;
}

export function parseQuotas(quotas) {
  return quotas.reduce((accum, quota) =>
    angular.extend(accum, {
      [quota.name]: quota.limit,
    }), {});
}

export function getTenantTemplate(tenant) {
  if (!tenant.extra_configuration.package_category) {
    return;
  }
  const quotas = parseQuotas(tenant.quotas);
  return {
    name: tenant.extra_configuration.package_name,
    category: tenant.extra_configuration.package_category,
    flavor: {
      cores: quotas.vcpu,
      ram: quotas.ram,
      disk: quotas.storage,
    }
  };
}

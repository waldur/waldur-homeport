export const openstackTemplateColumns = [
  {
    name: 'name',
    label: 'VPC package'
  },
  {
    name: 'category',
    label: 'Category'
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
  return `${value.name} (${props})`;
}

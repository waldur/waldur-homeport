export default {
  order: [
    'name',
    'template',
    'description',
    'access',
    'user_username',
    'user_password'
  ],
  options: {
    name: {
      type: 'string',
      required: true,
      label: 'Tenant name'
    },
    template: {
      type: 'list',
      required: true,
      label: 'VPC package',
      dialogTitle: 'Select Virtual Private Cloud package',
      dialogSize: 'lg',
      resource: 'package-templates',
      parser: packageParser,
      formatter: packageFormatter,
      columns: [
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
      ]
    },
    description: {
      type: 'text',
      label: 'Description'
    },
    access: {
      type: 'label',
      label: 'Access'
    },
    user_username: {
      type: 'string',
      label: 'Initial admin username',
      placeholder: 'generate automatically',
      help_text: 'Leave blank if you want admin username to be auto-generated'
    },
    user_password: {
      type: 'password',
      label: 'Initial admin password',
      placeholder: 'generate automatically',
      help_text: 'Leave blank if you want admin password to be auto-generated'
    }
  },
  summaryComponent: 'openstackTenantSummary'
};

function packageParser(choice) {
  /* Output is item with the following format:
  {
    "url": "https://example.com/api/package-templates/2/",
    "name": "Minimal VPC package",
    "price": {
      "day": 1,
      "month": 30,
      "year": 365
    },
    "ram": 20240,
    "cores": 20,
    "storage": 51200,
  }
  */
  const components = choice.item.components.reduce((map, item) => {
    map[item.type] = item.amount;
    return map;
  }, {});
  var dailyPrice = choice.item.price * 24;
  const item = angular.extend({
    url: choice.item.url,
    name: choice.item.name,
    category: choice.item.category,
    description: choice.item.description,
    dailyPrice: dailyPrice,
    monthlyPrice: dailyPrice * 30,
    annualPrice: dailyPrice * 365
  }, components);
  return {item};
}

function packageFormatter($filter, value) {
  const ram = $filter('filesize')(value.ram);
  const storage = $filter('filesize')(value.storage);
  const props = `${value.cores} vCPU, ${ram} RAM, ${storage} storage`;
  return `${value.name} (${props})`;
}

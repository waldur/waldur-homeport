export const openstackTemplateColumns = [
  {
    name: 'name',
    label: gettext('VPC package')
  },
  {
    name: 'category',
    label: gettext('Category'),
    filter: 'translate'
  },
  {
    name: 'cores',
    label: gettext('Max vCPU')
  },
  {
    name: 'ram',
    label: gettext('Max RAM'),
    filter: 'filesize'
  },
  {
    name: 'disk',
    label: gettext('Max storage'),
    filter: 'filesize'
  },
  {
    name: 'dailyPrice',
    label: gettext('1 day'),
    priceTooltip: true,
    filter: 'defaultCurrency'
  },
  {
    name: 'monthlyPrice',
    label: gettext('30 days'),
    priceTooltip: true,
    priceEstimated: true,
    filter: 'defaultCurrency'
  },
  {
    name: 'annualPrice',
    label: gettext('365 days'),
    priceTooltip: true,
    priceEstimated: true,
    filter: 'defaultCurrency'
  }
];

export const TEMPLATE_CATEGORIES = ['Trial', 'Small', 'Medium', 'Large'];

export const openstackTemplateFilters = {
  name: 'category',
  choices: [
    {
      value: '',
      label: gettext('All categories')
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

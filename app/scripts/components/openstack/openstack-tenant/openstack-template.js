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
    name: 'disk',
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

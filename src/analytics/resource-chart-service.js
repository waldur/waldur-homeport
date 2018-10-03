import { listToDict } from '../core/utils';

const chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(231,233,237)'
};

const resourceCategories = [
  {
    label: gettext('Virtual machines'),
    quota: 'nc_vm_count',
    color: chartColors.red,
    feature: 'vms',
  },
  {
    label: gettext('Private clouds'),
    quota: 'nc_private_cloud_count',
    color: chartColors.yellow,
    feature: 'private_clouds',
  },
  {
    label: gettext('Applications'),
    quota: 'nc_app_count',
    color: chartColors.purple,
    feature: 'apps',
  },
  {
    label: gettext('Block devices'),
    quota: 'nc_storage_count',
    color: chartColors.blue,
    feature: 'storage',
  },
];

const parseUsage = listToDict(
  item => item.name,
  item => item.usage
);

export default class ResourceChartService {
  // @ngInject
  constructor(features) {
    this.features = features;
  }

  getPieChart(customer) {
    const categories = this.getCategories();
    return this.parseQuotas(categories, customer.quotas);
  }

  getBarChart(projects, total) {
    const categories = this.getCategories();
    return projects
      .map(project => this.parseProject(categories, total, project))
      .filter(project => project.total > 0);
  }

  parseProject(categories, total, project) {
    const usage = this.parseQuotas(categories, project.quotas)
      .map(category => angular.extend({}, category, {
        relative: Math.round(category.value * 100.0 / total)
      }));
    return {
      name: project.name,
      uuid: project.uuid,
      categories: usage,
      total: this.getTotal(usage)
    };
  }

  parseQuotas(categories, quotas) {
    const usage = parseUsage(quotas);
    return categories.map(category => ({
      label: category.label,
      color: category.color,
      value: usage[category.quota],
    })).filter(category => category.value > 0);
  }

  getCategories() {
    return resourceCategories
      .filter(category => this.features.isVisible(category.feature));
  }

  getTotal(categories) {
    return categories.reduce((sum, category) => sum + category.value, 0);
  }
}

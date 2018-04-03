import { getAll } from '@waldur/core/api';
import { TreemapData } from '@waldur/resource/support/types';

interface QuotasMap {
  [key: string]: TreemapData;
}

function parseProjects(projects, quotaNames) {
  const customers = {};

  for (const project of projects) {
    const quotas = {};
    for (const quota of project.quotas) {
      quotas[quota.name] = quota.usage;
    }
    if (!customers[project.customer_name]) {
      customers[project.customer_name] = {};
    }
    customers[project.customer_name][project.name] = quotas;
  }

  const quotaTrees = {};
  for (const quotaName of quotaNames) {
    const tree = quotaTrees[quotaName] = [];

    for (const customer of Object.keys(customers)) {
      const customerProjects = customers[customer];
      let total = 0;
      const children = [];
      for (const project of Object.keys(customerProjects)) {
        const quotas = customerProjects[project];
        const value = quotas[quotaName];
        total += value;
        children.push({
          name: project,
          path: `${customer}/${project}`,
          value,
        });
      }
      tree.push({
        name: customer,
        path: customer,
        value: total,
        children,
      });
    }
  }
  return quotaTrees;
}

export function loadData(quotaNames: string[]): Promise<QuotasMap> {
  const params = {field: ['name', 'customer_name', 'customer_abbreviation', 'quotas']};
  return getAll('/projects/', {params}).then(projects => parseProjects(projects, quotaNames));
}

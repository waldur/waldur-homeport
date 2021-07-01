import { getAll } from '@waldur/core/api';

import { ProjectQuota, TreemapData } from './types';

export function parseProjects(projectQuotas: ProjectQuota[]): TreemapData {
  const customers = {};

  for (const project of projectQuotas) {
    const name = project.customer_abbreviation || project.customer_name;
    if (!customers[name]) {
      customers[name] = {};
    }
    customers[name][project.project_name] = project.value;
  }

  const tree = [];
  for (const customer of Object.keys(customers)) {
    const customerProjects = customers[customer];
    let total = 0;
    const children = [];
    for (const project of Object.keys(customerProjects)) {
      const value = customerProjects[project];
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
  return tree;
}

export const loadData = (quota_name: string) =>
  getAll<ProjectQuota>('/project-quotas/', {
    params: { quota_name },
  });

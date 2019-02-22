import { getAll } from '@waldur/core/api';
import { TreemapData } from '@waldur/resource/support/types';

export interface QuotasMap {
  [key: string]: TreemapData;
}

export function parseProjects(projects, quotaNames) {
  const customers = {};

  for (const project of projects) {
    const quotas = {};
    for (const quota of project.quotas) {
      quotas[quota.name] = quota.usage;
    }
    let currentPrice = 0;
    let estimatedPrice = 0;

    if (project.billing_price_estimate) {
      currentPrice = project.billing_price_estimate.current;
      estimatedPrice = project.billing_price_estimate.total;
    }
    // tslint:disable-next-line no-string-literal
    quotas['current_price'] = currentPrice;

    // tslint:disable-next-line no-string-literal
    quotas['estimated_price'] = estimatedPrice;

    const name = project.customer_abbreviation || project.customer_name;
    if (!customers[name]) {
      customers[name] = {};
    }
    customers[name][project.name] = quotas;
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

// tslint:disable-next-line:variable-name
export const loadData = (accounting_is_running: boolean) => {
  const field = [
    'name',
    'customer_name',
    'customer_abbreviation',
    'quotas',
    'billing_price_estimate',
  ];
  return getAll('/projects/', {params: {field, accounting_is_running}});
};

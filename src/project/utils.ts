import { defaultCurrency } from '@waldur/core/formatCurrency';
import { CostPolicy } from '@waldur/customer/cost-policies/types';
import { formatCostChart } from '@waldur/dashboard/api';
import { getScopeChartOptions } from '@waldur/dashboard/chart';
import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { Project } from '@waldur/workspace/types';

import { fetchLast12MonthProjectCosts } from './api';
import { ProjectCounterResourceItem } from './types';

export async function loadChart(project: Project, costPolicies: CostPolicy[]) {
  const invoices = await fetchLast12MonthProjectCosts(project.uuid);
  const chart = formatCostChart(invoices);
  return {
    chart,
    options: getScopeChartOptions(
      chart.data.map((item) => item.label),
      chart.data.map((item) => item.value),
      costPolicies.map((item, i) => ({
        label: `${translate('Policy')}  #${i + 1} (${defaultCurrency(
          item.limit_cost,
        )})`,
        value: item.limit_cost,
      })),
    ),
  };
}

export const parseProjectCounters = (
  categories: Category[],
  counters: object,
): ProjectCounterResourceItem[] => {
  return categories
    .map((category) => ({
      label: category.title,
      value: counters[category.uuid],
    }))
    .filter((row) => row.value);
};

export const combineProjectCounterRows = (
  rows: ProjectCounterResourceItem[],
): ProjectCounterResourceItem[] =>
  rows
    .filter((item) => item.value)
    .sort((a, b) => a.label.localeCompare(b.label));

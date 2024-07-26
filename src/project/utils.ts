import { defaultCurrency } from '@waldur/core/formatCurrency';
import { getProjectCostPolicies } from '@waldur/customer/cost-policies/api';
import { formatCostChart } from '@waldur/dashboard/api';
import { getScopeChartOptions } from '@waldur/dashboard/chart';
import { LINE_CHART_COLOR } from '@waldur/dashboard/constants';
import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { Project } from '@waldur/workspace/types';

import { fetchLast12MonthProjectCosts } from './api';
import { ProjectCounterResourceItem } from './types';

export async function loadChart(project: Project) {
  const [invoices, costPolicies] = await Promise.all([
    fetchLast12MonthProjectCosts(project.uuid),
    getProjectCostPolicies({
      scope_uuid: project.uuid,
      page: 1,
      page_size: 3,
    }),
  ]);
  const chart = formatCostChart(invoices);
  return {
    chart,
    options: getScopeChartOptions(
      chart.data.map((item) => item.label),
      chart.data.map((item) => item.value),
      (costPolicies || []).map((item, i) => ({
        label: `${translate('Policy')}  #${i + 1} (${defaultCurrency(
          item.limit_cost,
        )})`,
        value: item.limit_cost,
      })),
      LINE_CHART_COLOR,
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

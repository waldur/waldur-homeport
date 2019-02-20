import * as moment from 'moment-timezone';

import { get } from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { WorkspaceType } from '@waldur/workspace/types';

import { getDashboardCategories } from './categories';
import { Category } from './CategoryResources';
import { getResourceChartOptions } from './chart';
import { loadMarketplaceCategories } from './marketplace';
import { Quota, Scope, Chart, ChartData } from './types';

interface DailyQuota {
  [key: string]: number[];
}

export interface DateValuePair {
  date: string | Date;
  value: number;
}

const getDailyQuotas = params =>
  get<DailyQuota>('/daily-quotas/', {params}).then(response => response.data);

export type ChartLoader = (scope: Scope) => Promise<Chart[]>;

const formatCharts = (charts: Chart[]) =>
  charts.map(chart => getResourceChartOptions(
    chart.data.map(item => item.label),
    chart.data.map(item => item.value),
    null,
    chart.units || translate('Count'),
  ));

export async function loadCategories(workspace: WorkspaceType, scope: Scope): Promise<Category[]> {
  const result: Category[] = [];
  const features = ngInjector.get('features');
  if (features.isVisible('marketplace')) {
    const marketplaceCategories = await loadMarketplaceCategories(workspace, scope);
    result.push(...marketplaceCategories);
  } else {
    const categories = getDashboardCategories(workspace);
    const quotas = categories.reduce((acc, category) => [...acc, ...category.quotas], []);
    const charts = await getDailyQuotaCharts(quotas, scope);
    for (const category of categories) {
      const metrics = category.quotas.map(quota => quota.title);
      const formattedCharts = formatCharts(charts.filter(chart => metrics.includes(chart.title)));
      result.push({
        metrics,
        title: category.title,
        charts: formattedCharts,
        actions: category.actions,
      });
    }
  }
  return result;
}

export async function getDailyQuotaCharts(quotas: Quota[], scope: Scope): Promise<Chart[]> {
  const names = quotas.map(chart => chart.quota);
  const start = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const values = await getDailyQuotas({scope: scope.url, quota_names: names, start});
  return quotas.map(quota => formatQuotaChart(quota, values[quota.quota]));
}

export const formatQuotaChart = (quota: Quota, values: number[]): Chart => {
  const maxValue = Math.max(...values);
  const { formatter, units } = getFormatterUnits(quota.type, maxValue);

  const current = formatter(values[values.length - 1]);

  const data: ChartData = values.map((value, index) => {
    const date = moment().subtract(30, 'days').startOf('day').add(index, 'days');
    const formattedDate = formatDate(date);
    const formattedValue = formatter(value);
    return {label: formattedDate, value: formattedValue};
  });

  return {
    title: quota.title,
    units,
    current,
    data,
  };
};

export const getFormatterUnits = (chartType: 'filesize' | 'hours', value: number) => {
  let formatter = x => x;
  let units;

  if (chartType === 'filesize') {
    if (value > 1024 * 1024) {
      formatter = x => (x / 1024 / 1024).toFixed(1);
      units = 'TB';
    } else if (value > 1024) {
      formatter = x => (x / 1024).toFixed(1);
      units = 'GB';
    } else {
      units = 'MB';
    }
  } else if (chartType === 'hours') {
    formatter = x => Math.round(x / 60);
    units = 'hours';
  }
  return {formatter, units};
};

export const padMissingValues = (items: DateValuePair[], count) => {
  let end = moment();
  if (items.length > 0) {
    end = moment(items[items.length - 1].date);
  }
  while (items.length < count) {
    items.unshift({
      value: 0,
      date: new Date(end.subtract(1, 'month').toDate()),
    });
  }
  return items;
};

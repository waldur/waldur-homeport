import * as moment from 'moment';

import { get, getAll } from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

import { POINTS_COUNT, PROJECT_DASHBOARD, CUSTOMER_DASHBOARD } from '../constants';
import { getDashboardQuotas, Quota } from '../registry';
import { Scope, Chart, ChartData } from './types';

interface DailyQuota {
  [key: string]: number[];
}

interface InvoiceSummary {
  year: number;
  month: number;
  price: number;
}

interface DateValuePair {
  date: string | Date;
  value: number;
}

const getDailyQuotas = params =>
  get<DailyQuota>('/daily-quotas/', {params}).then(response => response.data);

const getInvoiceSummary = (customer: string) =>
  getAll<InvoiceSummary>('/invoices/', {params: {customer, field: ['year', 'month', 'price']}});

export function fetchChart(chartId: 'customer' | 'project', scope: Scope): Promise<Chart[]> {
  if (chartId === 'customer') {
    return getCustomerCharts(scope);
  } else if (chartId === 'project') {
    return getProjectCharts(scope);
  }
}

export async function getCustomerCharts(customer: Scope): Promise<Chart[]> {
  const quotas = getDashboardQuotas(CUSTOMER_DASHBOARD);
  const quotaCharts = await getDailyQuotaCharts(quotas, customer);
  if (isFeatureVisible('dashboard.total_cost')) {
    const invoices = await getInvoiceSummary(customer.url);
    const costChart = formatCostChart(invoices);
    return [costChart, ...quotaCharts];
  } else {
    return quotaCharts;
  }
}

export const getProjectCharts = (project: Scope): Promise<Chart[]> => {
  const quotas = getDashboardQuotas(PROJECT_DASHBOARD);
  return getDailyQuotaCharts(quotas, project);
};

export async function getDailyQuotaCharts(quotas: Quota[], scope: Scope): Promise<Chart[]> {
  const validQuotas = quotas.filter(chart => isFeatureVisible(chart.feature));
  const names = validQuotas.map(chart => chart.quota);
  const start = moment().subtract(POINTS_COUNT - 1, 'days').format('YYYY-MM-DD');
  const values = await getDailyQuotas({scope: scope.url, quota_names: names, start});
  return sortCharts(validQuotas.map(quota => formatQuotaChart(quota, values[quota.quota])));
}

export const formatQuotaChart = (quota: Quota, values: number[]): Chart => {
  const { formatter, units } = getFormatterUnits(quota.type, values);

  const current = formatter(values[values.length - 1]);

  const change = getRelativeChange(
    values[values.length - 2],
    values[values.length - 1],
  );

  const data: ChartData = values.map((value, index) => {
    const date = formatDate(moment().startOf('day').subtract(index, 'days'));
    const formattedValue = formatter(value);
    const label = translate('{value} at {date}', {value: formattedValue, date});
    return {label, value};
  });

  return {
    title: quota.title,
    units,
    current,
    change,
    data,
  };
};

export const getFormatterUnits = (chartType: 'filesize' | 'hours', values: number[]) => {
  let formatter = x => x;
  let units;

  const maxValue = Math.max(...values);
  if (chartType === 'filesize') {
    if (maxValue > 1024 * 1024) {
      formatter = x => (x / 1024 / 1024).toFixed(1);
      units = 'TB';
    } else if (maxValue > 1024) {
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

export const getRelativeChange = (prev: number, last: number): number => {
  const change = Math.round(100 * (last - prev) / prev);
  return Math.min(100, Math.max(-100, change));
};

export const sortCharts = (charts: Chart[]): Chart[] =>
  charts.sort((c1, c2) => c1.title.localeCompare(c2.title));

export const formatCostChart = (invoices: InvoiceSummary[]): Chart => {
  let items: DateValuePair[] = invoices.map(invoice => ({
    value: invoice.price,
    date: new Date(invoice.year, invoice.month - 1, 1),
  }));

  items.reverse();
  items = padMissingValues(items);
  const data = items.map((item, index) => {
    const isEstimate = index === items.length - 1;
    const date = isEstimate ? moment().endOf('month').toDate() : item.date;
    return {
      label: formatCostChartLabel(item.value, date, isEstimate),
      value: item.value,
    };
  });

  return {
    title: translate('Total cost'),
    data,
    current: defaultCurrency(items[items.length - 1].value),
    change: getRelativeChange(
      items[items.length - 2].value,
      items[items.length - 1].value,
    ),
  };
};

export const formatCostChartLabel = (value: number, date: string | Date, isEstimate: boolean): string => {
  let template = translate('{value} at {date}');
  if (isEstimate) {
    template = translate('{value} at {date}, estimated');
  }
  return translate(template, {
    value: defaultCurrency(value),
    date: formatDate(date),
  });
};

export const padMissingValues = (items: DateValuePair[]) => {
  let end = moment();
  if (items.length > 0) {
    end = moment(items[items.length - 1].date);
  }
  while (items.length !== POINTS_COUNT) {
    items.unshift({
      value: 0,
      date: new Date(end.subtract(1, 'month').toDate()),
    });
  }
  return items;
};

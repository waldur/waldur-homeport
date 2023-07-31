import { DateTime } from 'luxon';

import { get } from '@waldur/core/api';
import { parseDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { Quota, Scope, Chart, ChartData, InvoiceSummary } from './types';

interface DailyQuota {
  [key: string]: number[];
}

export interface DateValuePair {
  date: DateTime | string;
  value: number;
}

const getDailyQuotas = (params) =>
  get<DailyQuota>('/daily-quotas/', { params }).then(
    (response) => response.data,
  );

export const getFormatterUnits = (
  chartType: 'filesize' | 'hours',
  value: number,
) => {
  let formatter = (x) => x;
  let units;

  if (chartType === 'filesize') {
    if (value > 1024 * 1024) {
      formatter = (x) => (x / 1024 / 1024).toFixed(1);
      units = 'TB';
    } else if (value > 1024) {
      formatter = (x) => (x / 1024).toFixed(1);
      units = 'GB';
    } else {
      units = 'MB';
    }
  } else if (chartType === 'hours') {
    formatter = (x) => Math.round(x / 60);
    units = 'hours';
  }
  return { formatter, units };
};

export const formatQuotaChart = (quota: Quota, values: number[]): Chart => {
  const maxValue = Math.max(...values);
  const { formatter, units } = getFormatterUnits(quota.type, maxValue);

  const current = formatter(values[values.length - 1]);

  const data: ChartData = values.map((value, index) => {
    const date = DateTime.now()
      .minus({ days: 30 })
      .startOf('day')
      .plus({ days: index });
    const formattedValue = formatter(value);
    return { label: date.toISODate(), value: formattedValue };
  });

  return {
    title: quota.title,
    units,
    current,
    data,
  };
};

export async function getDailyQuotaCharts(
  quotas: Quota[],
  scope: Scope,
): Promise<Chart[]> {
  const names = quotas.map((chart) => chart.quota);
  const start = DateTime.now().minus({ days: 30 }).toISODate();
  const values = await getDailyQuotas({
    scope: scope.url,
    quota_names: names,
    start,
  });
  return quotas.map((quota) => formatQuotaChart(quota, values[quota.quota]));
}

export const padMissingValues = (items: DateValuePair[]): DateValuePair[] =>
  Array.from({ length: 12 }, (_, index) => {
    const date = DateTime.now()
      .startOf('month')
      .plus({ months: index - 11 });
    const item = items.find(
      (item) =>
        item.date instanceof DateTime &&
        item.date.year === date.year &&
        item.date.month === date.month,
    );
    return {
      date,
      value: item ? item.value : 0,
    };
  });

export const formatCostChartLabel = (
  value: number,
  date: DateTime,
  isEstimate: boolean,
): string => {
  let template = translate('{value} at {date}');
  if (isEstimate) {
    template = translate('{value} at {date}, estimated');
  }
  return translate(template, {
    value: defaultCurrency(value),
    date: date.toISODate(),
  });
};

export const formatCostChart = (invoices: InvoiceSummary[]): Chart => {
  let items: DateValuePair[] = invoices.map((invoice) => ({
    value: invoice.price,
    date: DateTime.fromObject({ year: invoice.year, month: invoice.month }),
  }));

  items.reverse();
  items = padMissingValues(items);
  const data = items.map((item, index) => {
    const isEstimate = index === items.length - 1;
    const date = isEstimate
      ? DateTime.now().endOf('month')
      : parseDate(item.date);
    return {
      label: formatCostChartLabel(item.value, date, isEstimate),
      value: item.value,
    };
  });

  return {
    title: translate('Estimated cost'),
    data,
    current: defaultCurrency(items[items.length - 1].value),
  };
};

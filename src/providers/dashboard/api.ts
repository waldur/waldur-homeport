import { DateTime } from 'luxon';

import { get, getList } from '@waldur/core/api';
import { parseDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { padMissingValues, DateValuePair } from '@waldur/dashboard/api';
import { getScopeChartOptions } from '@waldur/dashboard/chart';
import { Chart } from '@waldur/dashboard/types';
import { translate } from '@waldur/i18n';
import { ServiceProvider } from '@waldur/marketplace/types';

import { ProviderStatistics } from '../types';

interface EstimatedRevenueSummary {
  year: number;
  month: number;
  total: number;
}

const formatCostChartLabel = (
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

export const formatCostChart = (
  records: EstimatedRevenueSummary[],
  count,
): Chart => {
  let items: DateValuePair[] = records.map((record) => ({
    value: record.total,
    date: DateTime.fromObject({ year: record.year, month: record.month }),
  }));

  items.reverse();
  items = padMissingValues(items, count);
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

  let changes = 0;
  if (items.length > 1) {
    const curr = items[items.length - 1].value;
    const prev = items[items.length - 2].value;
    changes = (100 * (curr - prev)) / prev;
  } else if (items.length === 1 && items[0].value > 0) {
    changes = Infinity;
  }

  return {
    title: translate('Estimated revenue'),
    data,
    current: defaultCurrency(items[items.length - 1].value),
    changes,
  };
};

const getEstimatedRevenueSummary = (providerUuid: string) =>
  getList<EstimatedRevenueSummary>(
    `/marketplace-service-providers/${providerUuid}/revenue/`,
    {
      page_size: 12,
      field: ['year', 'month', 'total'],
    },
  );

async function getProviderCharts(provider: ServiceProvider): Promise<Chart[]> {
  const charts: Chart[] = [];
  const estimatedRevenue = await getEstimatedRevenueSummary(provider.uuid);
  const costChart = formatCostChart(estimatedRevenue, 12);
  charts.push(costChart);

  return charts;
}

export const loadProviderCharts = async (provider) => {
  const charts: Chart[] = await getProviderCharts(provider);
  return charts.map((chart) => ({
    chart,
    options: getScopeChartOptions(
      chart.data.map((item) => item.label),
      chart.data.map((item) => item.value),
    ),
  }));
};

export const getServiceProviderStatistics = (providerUuid: string) =>
  get<ProviderStatistics>(
    `/marketplace-service-providers/${providerUuid}/stat/`,
  );

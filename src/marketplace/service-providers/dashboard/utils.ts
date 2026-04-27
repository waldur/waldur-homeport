import { DateTime } from 'luxon';
import {
  marketplaceServiceProvidersRevenueList,
  ServiceProviderRevenues,
} from 'waldur-js-client';

import { parseDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { getScopeChartOptions } from '@/dashboard/chart';
import { Chart } from '@/dashboard/types';
import {
  padMissingValues,
  DateValuePair,
  formatCostChartLabel,
} from '@/dashboard/utils';
import { translate } from '@/i18n';
import { ServiceProvider } from '@/marketplace/types';

const formatCostChart = (records: ServiceProviderRevenues[]): Chart => {
  let items: DateValuePair[] = records.map((record) => ({
    value: record.total,
    date: DateTime.fromObject({
      year: record.year,
      month: record.month,
    }),
  }));

  items = padMissingValues(items);
  let total = 0;
  const data = items.map((item, index) => {
    total += item.value;
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
    total,
    changes,
  };
};

async function getProviderCharts(provider: ServiceProvider): Promise<Chart[]> {
  const charts: Chart[] = [];
  const estimatedRevenue = (
    await marketplaceServiceProvidersRevenueList({
      path: {
        uuid: provider.uuid,
      },
      query: {
        page_size: 12,
      },
    })
  ).data;
  const costChart = formatCostChart(estimatedRevenue);
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

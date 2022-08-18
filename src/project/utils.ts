import { DateTime } from 'luxon';

import { parseDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { DateValuePair, padMissingValues } from '@waldur/dashboard/api';
import { getScopeChartOptions } from '@waldur/dashboard/chart';
import { Chart } from '@waldur/dashboard/types';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

import { fetchLast12MonthProjectCosts } from './api';
import { InvoiceCostSummary } from './types';

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
  invoices: InvoiceCostSummary[],
  count,
): Chart => {
  let items: DateValuePair[] = invoices.map((invoice) => ({
    value: invoice.price,
    date: DateTime.fromObject({ year: invoice.year, month: invoice.month }),
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

  return {
    title: translate('Estimated cost'),
    data,
    current: defaultCurrency(items[items.length - 1].value),
  };
};

export async function loadChart(project: Project) {
  const invoices = await fetchLast12MonthProjectCosts(project.uuid);
  const chart = formatCostChart(invoices, 12);
  return {
    chart,
    options: getScopeChartOptions(
      chart.data.map((item) => item.label),
      chart.data.map((item) => item.value),
    ),
  };
}

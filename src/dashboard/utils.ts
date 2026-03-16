import { SeriesOption } from 'echarts';
import { DateTime } from 'luxon';
import { dailyQuotasRetrieve, Invoice, InvoiceCost } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { parseDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { generateBrandColors } from '@waldur/core/generateColors';
import { getBrandColor } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import {
  getCostWidgetChartOptions,
  getCreditWidgetChartOptions,
} from './chart';
import { Chart, ChartData, CostChart, CreditChart, Scope } from './types';

export interface DateValuePair {
  date: DateTime | string;
  value: number;
}

interface DateCostPair {
  date: DateTime | string;
  value: number;
  compensation: number;
  incurred: number;
}

const formatTeamSizeChart = (values: number[] = []): Chart => {
  const data: ChartData = values.map((value, index) => {
    const date = DateTime.now()
      .minus({ days: 30 })
      .startOf('day')
      .plus({ days: index });
    return {
      label: translate('{value} at {date}', {
        value,
        date: date.toISODate(),
      }),
      value,
    };
  });

  let changesPercent = 0;
  const lastCount = Number(values[0]);
  const currentCount = Number(values[values.length - 1]);
  if (lastCount || currentCount === 0) {
    changesPercent = ((currentCount - lastCount) / lastCount) * 100;
  }

  return {
    title: translate('Team'),
    units: null,
    current: currentCount,
    total: currentCount,
    data,
    changes: changesPercent,
  };
};

export async function getTeamSizeChart(scope: Scope): Promise<Chart> {
  const quota = 'nc_user_count';
  const start = DateTime.now().minus({ days: 30 }).toISODate();
  const values = await dailyQuotasRetrieve({
    query: {
      scope: scope.url,
      quota_names: [quota],
      start,
    },
  }).then((response) => response.data);
  return formatTeamSizeChart(values[quota]);
}

export const padMissingValues = <T extends DateValuePair>(
  items: T[],
  dataKeys = ['value'],
): T[] =>
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
    const dataItem: any = { date };
    dataKeys.forEach((key) => {
      dataItem[key] = item?.[key] || 0;
    });
    return dataItem;
  });

export const formatCostChartLabel = (
  value: number,
  date: DateTime,
  isEstimate: boolean = false,
): string => {
  return isEstimate
    ? translate('{value} at {date}, estimated', {
        value: defaultCurrency(value),
        date: date.toISODate(),
      })
    : translate('{value} at {date}', {
        value: defaultCurrency(value),
        date: date.toISODate(),
      });
};

export const formatOrganizationCostChart = (invoices: Invoice[]): CostChart => {
  const items: DateCostPair[] = invoices.map((invoice) => ({
    value: Number(invoice.price),
    incurred: Number(invoice.incurred_costs),
    compensation: Number(invoice.compensations) * -1,
    date: DateTime.fromObject({ year: invoice.year, month: invoice.month }),
  }));
  return getFormattedCostChart(items);
};

export const formatProjectCostChart = (invoices: InvoiceCost[]): CostChart => {
  const items: DateCostPair[] = invoices.map((invoice) => ({
    value: Number(invoice.price),
    incurred: Number(invoice['incurred']), // FIX this in the InvoiceCost type
    compensation: Number(invoice['compensation']) * -1, // FIX this in the InvoiceCost type
    date: DateTime.fromObject({ year: invoice.year, month: invoice.month }),
  }));
  return getFormattedCostChart(items);
};

const getFormattedCostChart = (items: DateCostPair[]): CostChart => {
  items.reverse();
  items = padMissingValues(items, ['value', 'incurred', 'compensation']);
  let total = 0;
  const data = [];
  const incurred = [];
  const compensation = [];
  items.forEach((item, index) => {
    total += item.value;
    const isEstimate = index === items.length - 1;
    const date = isEstimate
      ? DateTime.now().endOf('month')
      : parseDate(item.date);
    data.push({
      label: formatCostChartLabel(item.value, date, isEstimate),
      value: item.value,
      xAxisValue: date.monthShort,
    });
    incurred.push({
      label: formatCostChartLabel(item.incurred, date, isEstimate),
      value: item.incurred,
      xAxisValue: date.monthShort,
    });
    compensation.push({
      label: formatCostChartLabel(item.compensation, date, isEstimate),
      value: item.compensation,
      xAxisValue: date.monthShort,
    });
  });

  return {
    title: translate('Cost'),
    data,
    incurred,
    compensation,
    current: defaultCurrency(items[items.length - 1].value),
    total,
    yAxisLabel: translate('Cost ({currency})', {
      currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
    }),
  };
};

const formatCreditChart = (
  invoices: InvoiceCost[],
  creditValue: string | number,
): CreditChart => {
  let items: DateValuePair[] = invoices.map((invoice) => ({
    value: Number(invoice.price),
    date: DateTime.fromObject({ year: invoice.year, month: invoice.month }),
  }));

  items.reverse();
  items = padMissingValues(items);
  let total = 0;
  const data = []; // As 'used' in the chart
  const remaining = [];
  items.forEach((item) => {
    total += item.value;
    const date = parseDate(item.date);
    data.push({
      label: formatCostChartLabel(item.value, date),
      value: item.value,
      xAxisValue: date.monthShort,
    });
    const remainingCredit = Number(creditValue ?? 0) - item.value;
    remaining.push({
      label: formatCostChartLabel(remainingCredit, date),
      value: remainingCredit,
      xAxisValue: date.monthShort,
    });
  });

  return {
    title: translate('Credit consumption'),
    data,
    remaining,
    current: defaultCurrency(remaining[remaining.length - 1].value), // As remaining credit
    total,
    yAxisLabel: translate('Credit used'),
  };
};

export const getCreditChartAndOptions = (
  invoiceCosts: InvoiceCost[],
  creditValue: string | number,
) => {
  const chart = formatCreditChart(invoiceCosts, creditValue);

  const brand = getBrandColor();
  const brandColors = generateBrandColors(brand);

  const series: SeriesOption[] = [
    {
      name: translate('Credit used'),
      type: 'bar',
      data: chart.data as any,
      color: brandColors[300],
    },
  ];

  return {
    chart,
    options: getCreditWidgetChartOptions(
      series,
      chart.data.map((datum) => datum.xAxisValue),
    ),
  };
};

export const getCostChartAndOptions = (
  chart: CostChart,
  hlines?: Array<{ label; value }>,
) => {
  const brand = getBrandColor();
  const brandColors = generateBrandColors(brand);

  const hasCompensations =
    chart.compensation?.length > 0 &&
    chart.compensation.some((item) => Number(item.value) !== 0);

  const series: SeriesOption[] = [
    {
      name: translate('Incurred'),
      type: 'bar',
      stack: 'cost',
      data: chart.incurred.slice(0, chart.incurred.length - 1),
      color: brandColors[600],
    },
    hasCompensations && {
      name: translate('Compensation'),
      type: 'bar',
      stack: 'compensation',
      data: chart.compensation.slice(0, chart.compensation.length - 1),
      color: brandColors[300],
    },
    {
      name: translate('Estimated cost'),
      type: 'bar',
      stack: 'cost',
      data: Array.from({ length: chart.incurred.length - 1 }).concat(
        chart.incurred[chart.incurred.length - 1],
      ),
      color: '#98a2b3', // gray-400
    },
    hasCompensations && {
      name: translate('Estimated compensation'),
      type: 'bar',
      stack: 'compensation',
      data: Array.from({ length: chart.compensation.length - 1 }).concat(
        chart.compensation[chart.compensation.length - 1],
      ),
      color: '#d0d5dd', // gray-300
    },
  ].filter(Boolean) as SeriesOption[];

  return {
    chart,
    options: getCostWidgetChartOptions(
      series,
      hlines,
      chart.data.map((datum) => datum.xAxisValue),
    ),
  };
};

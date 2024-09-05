import { DateTime } from 'luxon';

import { get } from '@waldur/core/api';
import { parseDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { Scope, Chart, ChartData, InvoiceSummary } from './types';

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

const formatTeamSizeChart = (values: number[]): Chart => {
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
    title: translate('Team size'),
    units: null,
    current: currentCount,
    data,
    changes: changesPercent,
  };
};

export async function getTeamSizeChart(scope: Scope): Promise<Chart> {
  const quota = 'nc_user_count';
  const start = DateTime.now().minus({ days: 30 }).toISODate();
  const values = await getDailyQuotas({
    scope: scope.url,
    quota_names: [quota],
    start,
  });
  return formatTeamSizeChart(values[quota]);
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

  const lastMonths = items.slice(-2);
  let changesPercent = 0;
  const lastMonthCost = Number(lastMonths[0].value);
  const currentMonthCost = Number(lastMonths[1].value);
  if (lastMonthCost || lastMonthCost === 0) {
    changesPercent = ((currentMonthCost - lastMonthCost) / lastMonthCost) * 100;
  }

  return {
    title: translate('Estimated cost'),
    data,
    current: defaultCurrency(items[items.length - 1].value),
    changes: changesPercent,
  };
};

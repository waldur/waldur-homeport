import { DateTime } from 'luxon';

import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getAccountingTypeOptions } from '@waldur/marketplace/offerings/update/components/ComponentAccountingTypeField';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ComponentUsage } from './types';

interface RowData {
  value: number;
  description: string;
}

const formatChart = (
  name: string,
  color: string,
  labels: string[],
  usages: RowData[],
) => ({
  toolbox: {
    feature: {
      saveAsImage: {
        title: translate('Save'),
        name: `components-usage-chart-${DateTime.now().toISODate()}`,
        show: true,
      },
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999',
      },
    },
    formatter: (params) => {
      const date = params[0].axisValue;
      const value = params[0].data.value;
      const description = params[0].data.description;
      if (!value) {
        return null;
      }
      const tooltip =
        `${translate('Date')}: ${date}` +
        `<br/>${translate('Value')}: ${value}` +
        `${
          description ? `<br/>${translate('Description')}: ${description}` : ''
        }`;
      return `<span>${tooltip}</span>`;
    },
  },
  xAxis: [
    {
      type: 'category',
      data: labels,
      axisPointer: {
        type: 'shadow',
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name,
      axisLabel: {
        formatter: '{value}',
      },
    },
  ],
  series: [
    {
      type: 'bar',
      data: usages,
      color,
    },
  ],
});

const getMonthsPeriods = (months): DateTime[] => {
  const periods = [];
  for (let i = months - 1; i >= 0; i--) {
    periods.push(DateTime.now().minus({ months: i }));
  }
  return periods;
};

const getUsages = (
  periods: DateTime[],
  usages: ComponentUsage[],
): RowData[] => {
  const result = [];
  for (let i = 0; i < periods.length; i++) {
    for (let j = 0; j < usages.length; j++) {
      if (
        periods[i].toFormat('yyyy-MM') ===
        parseDate(usages[j].billing_period).toFormat('yyyy-MM')
      ) {
        result.push({
          value: usages[j].usage,
          description: usages[j].description,
        });
        break;
      }
      if (j === usages.length - 1) {
        result.push({
          value: 0,
          description: '',
        });
      }
    }
  }
  return result;
};

export const getEChartOptions = (
  component: OfferingComponent,
  usages: ComponentUsage[],
  months: number,
  color: string,
) => {
  let numberOfMonths = months;
  if (!numberOfMonths) {
    // Calculate number of months from usages, if months param is not given
    const startDateUnix = Math.min(
      ...usages.map((usage) => new Date(usage.date).getTime()),
    );
    const _months = parseDate(startDateUnix)
      .startOf('month')
      .diffNow()
      .as('months');
    numberOfMonths = Math.ceil(Math.abs(_months));
  }
  const periods = getMonthsPeriods(numberOfMonths);
  const labels = periods.map((date) => `${date.month} - ${date.year}`);
  const formattedUsages = getUsages(
    periods,
    usages.filter((usage) => usage.type === component.type),
  );
  return formatChart(component.measured_unit, color, labels, formattedUsages);
};

export const getUsageHistoryPeriodOptions = (startDate = null) => {
  const now = DateTime.now();
  const start = parseDate(startDate);
  let totalMonths = Math.max(
    0,
    (now.year - start.year) * 12 + (now.month - start.month),
  );
  if (now.day >= start.day || totalMonths > 0) {
    totalMonths += 1;
  }
  const options: Array<{ value; label }> = [];
  if (totalMonths > 6) {
    options.push({
      value: 6,
      label: translate('{month} months', { month: 6 }),
    });
  }
  if (totalMonths > 12) {
    options.push({
      value: 12,
      label: translate('{month} months', { month: 12 }),
    });
  }
  options.push({ value: totalMonths, label: translate('From creation') });
  return options;
};

export const getBillingTypeLabel = (value) =>
  getAccountingTypeOptions().find((option) => option.value === value)?.label ||
  'N/A';

export const getTableData = (
  component: OfferingComponent,
  usages: ComponentUsage[],
) => {
  return usages
    .filter((usage) => usage.type === component.type)
    .map((usage) => {
      return {
        date: parseDate(usage.billing_period).toFormat('MM/yyyy'),
        usage: Number(usage.usage),
      };
    });
};

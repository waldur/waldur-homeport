import { DateTime } from 'luxon';

import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getAccountingTypeOptions } from '@waldur/marketplace/offerings/create/ComponentAccountingTypeField';
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

// Filters usages by type and the last 12 months period
const filterUsages = (
  component: OfferingComponent,
  usages: ComponentUsage[],
) => {
  const threshold = DateTime.now().minus({ months: 12 });
  return usages.filter((usage) => {
    const usageDate = parseDate(usage.date);
    return (
      threshold < usageDate &&
      DateTime.now().diff(usageDate).as('days') >= 0 &&
      usage.type === component.type
    );
  });
};

const getLastTwelveMonths = (): DateTime[] => {
  const periods = [];
  for (let i = 11; i >= 0; i--) {
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
        parseDate(usages[j].date).toFormat('yyyy-MM')
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
  color: string,
) => {
  const periods = getLastTwelveMonths();
  const labels = periods.map((date) => `${date.month} - ${date.year}`);
  const formattedUsages = getUsages(periods, filterUsages(component, usages));
  return formatChart(component.measured_unit, color, labels, formattedUsages);
};

export const getBillingTypeLabel = (value) =>
  getAccountingTypeOptions().find((option) => option.value === value)?.label ||
  'N/A';

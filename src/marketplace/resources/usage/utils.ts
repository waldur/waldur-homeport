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

const getLast24Months = (): DateTime[] => {
  const periods = [];
  for (let i = 23; i >= 0; i--) {
    periods.push(DateTime.now().minus({ months: i }));
  }
  return periods;
};

const getUsages = (
  periods: DateTime[],
  usages: ComponentUsage[],
  convertHoursToMinutes = false,
): RowData[] => {
  const result = [];
  for (let i = 0; i < periods.length; i++) {
    for (let j = 0; j < usages.length; j++) {
      if (
        periods[i].toFormat('yyyy-MM') ===
        parseDate(usages[j].billing_period).toFormat('yyyy-MM')
      ) {
        result.push({
          value: convertHoursToMinutes ? usages[j].usage * 60 : usages[j].usage,
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
  measureUnit?: 'hours' | 'minutes',
) => {
  const toMinutes =
    component.measured_unit === 'hours' && measureUnit === 'minutes';
  const periods = getLast24Months();
  const labels = periods.map((date) => `${date.month} - ${date.year}`);
  const formattedUsages = getUsages(
    periods,
    usages.filter((usage) => usage.type === component.type),
    toMinutes,
  );
  return formatChart(
    measureUnit || component.measured_unit,
    color,
    labels,
    formattedUsages,
  );
};

export const getBillingTypeLabel = (value) =>
  getAccountingTypeOptions().find((option) => option.value === value)?.label ||
  'N/A';

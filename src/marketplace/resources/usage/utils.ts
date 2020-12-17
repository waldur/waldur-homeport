import { Moment } from 'moment';
import moment from 'moment-timezone';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
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
        name: `components-usage-chart-${formatDate(moment())}`,
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
  const threshold = moment().subtract(12, 'months');
  return usages.filter((usage) => {
    return (
      threshold.isBefore(usage.date) &&
      moment().diff(usage.date) >= 0 &&
      usage.type === component.type
    );
  });
};

const getLastTwelveMonths = (): Moment[] => {
  const periods = [];
  for (let i = 11; i >= 0; i--) {
    periods.push(moment().subtract(i, 'months'));
  }
  return periods;
};

const getUsages = (periods: Moment[], usages: ComponentUsage[]): RowData[] => {
  const result = [];
  for (let i = 0; i < periods.length; i++) {
    for (let j = 0; j < usages.length; j++) {
      if (
        periods[i].format('YYYY-MM') ===
        moment(usages[j].date).format('YYYY-MM')
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

const formatMonthPeriod = (date: Moment) => {
  const month = date.month() + 1;
  const year = date.year();
  return `${month} - ${year}`;
};

export const getEChartOptions = (
  component: OfferingComponent,
  usages: ComponentUsage[],
  color: string,
) => {
  const periods = getLastTwelveMonths();
  const labels = periods.map(formatMonthPeriod);
  const formattedUsages = getUsages(periods, filterUsages(component, usages));
  return formatChart(component.measured_unit, color, labels, formattedUsages);
};

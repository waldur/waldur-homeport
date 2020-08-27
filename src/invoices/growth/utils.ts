import * as moment from 'moment-timezone';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const formatGrowthChart = (growthChartData) => {
  return {
    toolbox: {
      feature: {
        saveAsImage: {
          title: translate('Save'),
          name: `growth-chart-${moment().format('DD-MM-YYYY')}`,
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
    },
    xAxis: [
      {
        type: 'category',
        axisPointer: {
          type: 'shadow',
        },
        data: growthChartData.periods.map((row, index) => {
          const date = moment(row, 'YYYY-MM');
          const monthName = date.format('MMMM');
          const year = date.format('YYYY');
          return index === growthChartData.periods.length - 1
            ? `${monthName}, ${year} (${translate('estimated')})`
            : `${monthName}, ${year}`;
        }),
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: translate('Paid'),
        min: 0,
        max: null,
        interval: null,
        axisLabel: {
          formatter: `${ENV.currency}{value}`,
        },
      },
      {
        type: 'value',
        name: translate('Total'),
        min: 0,
        max: null,
        interval: null,
        axisLabel: {
          formatter: `${ENV.currency}{value}`,
        },
      },
    ],
    legend: {
      data: [
        translate('Total'),
        ...growthChartData.customer_periods.map((row) => row.name),
        translate('Others'),
      ],
    },
    series: [
      {
        name: translate('Total'),
        type: 'line',
        yAxisIndex: 1,
        data: growthChartData.total_periods,
      },
      ...growthChartData.customer_periods.map((row) => ({
        name: row.name,
        type: 'bar',
        data: row.periods,
        yAxisIndex: 0,
      })),
      {
        name: translate('Others'),
        type: 'bar',
        data: growthChartData.other_periods,
        yAxisIndex: 0,
      },
    ],
  };
};

import { DateTime } from 'luxon';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const formatGrowthChart = (growthChartData) => {
  return {
    toolbox: {
      feature: {
        saveAsImage: {
          title: translate('Save'),
          name: `growth-chart-${DateTime.now().toISODate()}`,
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
          const date = DateTime.fromFormat(row, 'yyyy-MM');
          const monthName = date.toFormat('MMMM');
          const year = date.toFormat('yyyy');
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
          formatter: `${ENV.plugins.WALDUR_CORE.CURRENCY_NAME}{value}`,
        },
      },
      {
        type: 'value',
        name: translate('Total'),
        min: 0,
        max: null,
        interval: null,
        axisLabel: {
          formatter: `${ENV.plugins.WALDUR_CORE.CURRENCY_NAME}{value}`,
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

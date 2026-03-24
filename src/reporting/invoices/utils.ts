import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';

import { ENV } from '@waldur/core/config';
import { getBrandColor } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const formatGrowthChart = (growthChartData?): EChartsOption => {
  if (!growthChartData) return {};
  return {
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
        data: (growthChartData.periods || []).map((row, index) => {
          const date = DateTime.fromFormat(row, 'yyyy-M');
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
        axisLine: { show: true },
        axisTick: { show: true },
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
        axisLine: { show: true },
        axisTick: { show: true },
      },
    ],
    legend: {
      data: [
        translate('Total'),
        ...(growthChartData.customer_periods || []).map((row) => row.name),
        translate('Others'),
      ],
    },
    series: [
      {
        name: translate('Total'),
        type: 'line',
        yAxisIndex: 1,
        data: growthChartData.total_periods,
        itemStyle: {
          color: getBrandColor(),
        },
      },
      ...(growthChartData.customer_periods || []).map((row) => ({
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

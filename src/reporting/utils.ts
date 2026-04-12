import { EChartsOption, graphic } from 'echarts';

import { ENV } from '@waldur/core/config';
import { formatUsageValue } from '@waldur/core/formatNumber';
import { hexToRgb } from '@waldur/core/generateColors';
import { getChartBrandColor } from '@waldur/dashboard/constants';
import { translate } from '@waldur/i18n';

export const isReportingScreenEnabled = (screen: string) => {
  const enabledScreens = ENV.plugins.WALDUR_CORE?.ENABLED_REPORTING_SCREENS;
  return Array.isArray(enabledScreens) ? enabledScreens.includes(screen) : true;
};

export const hasAnyReportingEnabled = () => {
  const enabledScreens = ENV.plugins.WALDUR_CORE?.ENABLED_REPORTING_SCREENS;
  return Array.isArray(enabledScreens) ? enabledScreens.length > 0 : true;
};

export const usageTableTabs = [
  {
    key: 'resource-usage',
    title: translate('Resource usage'),
    state: 'reporting-resource-usage',
  },
  {
    key: 'user-usage',
    title: translate('User usage'),
    state: 'reporting-user-usage',
  },
];

export const getUsageLineChartOptions = (
  dates: string[],
  values: (string | number)[],
): EChartsOption => {
  const color = getChartBrandColor();
  const rgb = hexToRgb(color);
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const point = params[0];
        return `${point.axisValue}<br/>${formatUsageValue(point.data)}`;
      },
    },
    grid: {
      left: 10,
      top: 10,
      right: 0,
      bottom: 0,
      containLabel: false,
    },
    xAxis: {
      data: dates,
      show: false,
    },
    yAxis: {
      type: 'value',
      splitNumber: 3,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(129, 129, 129, 0.3)',
          type: 'solid',
        },
      },
    },
    series: [
      {
        type: 'line',
        data: values,
        color,
        smooth: true,
        showSymbol: false,
        areaStyle: {
          origin: 'start',
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `rgba(${rgb}, 0.2)` },
            { offset: 1, color: `rgba(${rgb}, 0)` },
          ]),
        },
      },
    ],
  };
};

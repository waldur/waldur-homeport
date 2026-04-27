import { EChartsOption, graphic } from 'echarts';

import { ENV } from '@/core/config';
import { formatUsageValue } from '@/core/formatNumber';
import { hexToRgb } from '@/core/generateColors';
import { getChartBrandColor } from '@/dashboard/constants';
import { translate } from '@/i18n';

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
  usageValues: (string | number)[],
  limitValues: (string | number)[] = [],
): EChartsOption => {
  const color = getChartBrandColor();
  const rgb = hexToRgb(color);
  const series: any[] = [
    {
      type: 'line',
      name: translate('Usage'),
      data: usageValues,
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
  ];

  if (limitValues?.length && limitValues.some((v) => Number(v) > 0)) {
    series.push({
      type: 'line',
      name: translate('Limit'),
      data: limitValues,
      color: '#e0e0e0', // Light gray for limit
      smooth: true,
      showSymbol: false,
      lineStyle: {
        type: 'dashed',
        width: 1,
      },
    });
  }

  return {
    tooltip: {
      trigger: 'axis',
      order: 'seriesDesc',
      formatter: (params: any) => {
        let res = `${params[0].axisValue}`;
        params.forEach((param) => {
          res += `<br/>${param.marker} ${param.seriesName}: <b>${formatUsageValue(
            param.data,
          )}</b>`;
        });
        return res;
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
    series,
  };
};

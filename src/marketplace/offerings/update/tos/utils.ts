import { EChartsOption } from 'echarts';
import type { VersionAdoption, TimeSeriesToSData } from 'waldur-js-client';

import { getChartThemeColors } from '@/dashboard/chartColors';

/**
 * Format version adoption data for ECharts bar chart
 */
export const formatVersionAdoptionChart = (
  data: VersionAdoption[],
): EChartsOption => {
  const colors = getChartThemeColors();
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.version),
      axisLabel: {
        rotate: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Users',
      minInterval: 1,
    },
    series: [
      {
        name: 'Users',
        type: 'bar',
        data: data.map((d) => d.users_count),
        itemStyle: {
          color: colors.brand300,
          borderRadius: [5, 5, 0, 0],
        },
      },
    ],
  };
};

/**
 * Format consent status data for ECharts pie chart
 */
export const formatConsentStatusChart = (stats: {
  accepted_consents_count: number;
  revoked_consents_count: number;
  total_users_count: number;
  total_consents_count: number;
  active_users_count: number;
}): EChartsOption => {
  const colors = getChartThemeColors();
  const accepted = stats.accepted_consents_count;
  const revoked = stats.revoked_consents_count;
  const notAccepted = Math.max(0, stats.total_users_count - accepted - revoked);

  const pieData = [
    { value: accepted, name: 'Accepted' },
    { value: notAccepted, name: 'Not accepted' },
    { value: revoked, name: 'Revoked' },
  ];

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: '0',
      left: 'center',
    },
    grid: {
      bottom: '15%',
    },
    series: [
      {
        name: 'Consent status',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: pieData,
        color: [colors.brand600, colors.brand300, colors.track],
      },
    ],
  };
};

/**
 * Format accepted consents trend for ECharts line chart
 */
export const formatAcceptedTrendChart = (
  data: TimeSeriesToSData[],
): EChartsOption => {
  const colors = getChartThemeColors();
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((d) => d.date),
    },
    yAxis: {
      type: 'value',
      name: 'Amount',
      minInterval: 1,
    },
    series: [
      {
        name: 'Accepted consents',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.count),
        itemStyle: {
          color: colors.brand600,
        },
        lineStyle: {
          color: colors.brand600,
        },
        areaStyle: {
          color: colors.brand600,
          opacity: 0.3,
        },
      },
    ],
  };
};

/**
 * Format revoked consents trend for ECharts line chart
 */
export const formatRevokedTrendChart = (
  data: TimeSeriesToSData[],
): EChartsOption => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((d) => d.date),
    },
    yAxis: {
      type: 'value',
      name: 'Amount',
      minInterval: 1,
    },
    series: [
      {
        name: 'Revoked consents',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.count),
        itemStyle: {
          color: '#F1416C',
        },
        lineStyle: {
          color: '#F1416C',
        },
        areaStyle: {
          color: '#F1416C',
          opacity: 0.3,
        },
      },
    ],
  };
};

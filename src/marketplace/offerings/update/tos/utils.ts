import { EChartsOption } from 'echarts';
import type { VersionAdoption, TimeSeriesToSData } from 'waldur-js-client';

/**
 * Format version adoption data for ECharts bar chart
 */
export const formatVersionAdoptionChart = (
  data: VersionAdoption[],
): EChartsOption => {
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
          color: '#97bf89',
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
  const accepted = stats.accepted_consents_count;
  const revoked = stats.revoked_consents_count;
  // Pending = total active users minus those who have accepted or revoked
  const pending =
    stats.active_users_count -
    stats.accepted_consents_count -
    stats.revoked_consents_count;

  const pieData = [
    { value: accepted, name: 'Accepted' },
    { value: pending, name: 'Pending' },
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
        color: ['#307300', '#97bf89', '#e4e7ec'],
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
          color: '#307300',
        },
        lineStyle: {
          color: '#307300',
        },
        areaStyle: {
          color: '#307300',
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

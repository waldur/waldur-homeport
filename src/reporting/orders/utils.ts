import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import { DailyOrderStats } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { ORDER_STATES, ORDER_TYPES, STATE_COLORS, TYPE_COLORS } from './types';

/**
 * Format orders trend chart (bar chart for daily volume)
 */
export const formatOrdersTrendChart = (
  dailyStats: DailyOrderStats[],
): EChartsOption => {
  const dates = dailyStats.map((d) =>
    DateTime.fromISO(d.date).toFormat('MMM dd'),
  );
  const totals = dailyStats.map((d) => d.total);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    toolbox: {
      feature: {
        saveAsImage: {
          title: translate('Save'),
          name: `orders-trend-${DateTime.now().toISODate()}`,
          show: true,
        },
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
      data: dates,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: translate('Orders'),
      minInterval: 1,
    },
    series: [
      {
        name: translate('Orders'),
        type: 'bar',
        data: totals,
        itemStyle: {
          color: '#009ef7',
        },
        emphasis: {
          itemStyle: {
            color: '#0095e8',
          },
        },
      },
    ],
  };
};

/**
 * Format orders by state donut chart
 */
export const formatOrdersStateChart = (
  stateStats: Record<string, number>,
): EChartsOption => {
  const data = Object.entries(stateStats)
    .filter(([, value]) => value > 0)
    .map(([state, value]) => ({
      name: ORDER_STATES[state] || state,
      value,
      itemStyle: {
        color: STATE_COLORS[state] || '#7e8299',
      },
    }));

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
    },
    series: [
      {
        name: translate('Orders by State'),
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data,
      },
    ],
  };
};

/**
 * Format orders by type bar chart
 */
export const formatOrdersTypeChart = (
  typeStats: Record<string, number>,
): EChartsOption => {
  const types = Object.keys(ORDER_TYPES);
  const data = types.map((type) => ({
    value: typeStats[type] || 0,
    itemStyle: {
      color: TYPE_COLORS[type] || '#7e8299',
    },
  }));

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
      data: types.map((type) => ORDER_TYPES[type] || type),
    },
    yAxis: {
      type: 'value',
      name: translate('Orders'),
      minInterval: 1,
    },
    series: [
      {
        name: translate('Orders'),
        type: 'bar',
        data,
        barWidth: '60%',
      },
    ],
  };
};

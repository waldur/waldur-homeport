import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import { DailyOrderStats } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
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
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
    },
    series: [
      {
        name: translate('Orders by State'),
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['50%', '45%'],
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
 * Format orders by type pie chart
 */
export const formatOrdersTypeChart = (
  typeStats: Record<string, number>,
): EChartsOption => {
  const data = Object.entries(typeStats)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => ({
      name: ORDER_TYPES[type] || type,
      value,
      itemStyle: {
        color: TYPE_COLORS[type] || '#7e8299',
      },
    }));

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
    },
    series: [
      {
        name: translate('Orders by Type'),
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['50%', '45%'],
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
        data,
      },
    ],
  };
};

/**
 * Format daily order cost bar chart
 */
export const formatDailyCostChart = (
  dailyStats: DailyOrderStats[],
): EChartsOption => {
  const dates = dailyStats.map((d) =>
    DateTime.fromISO(d.date).toFormat('MMM dd'),
  );
  const costs = dailyStats.map((d) =>
    d.total_cost ? parseFloat(d.total_cost) : 0,
  );

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const value = params[0]?.value || 0;
        return `${params[0]?.name}: ${defaultCurrency(value)}`;
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
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: translate('Cost'),
      axisLabel: {
        formatter: (value) => defaultCurrency(value),
      },
    },
    series: [
      {
        name: translate('Cost'),
        type: 'bar',
        data: costs,
        itemStyle: { color: '#50cd89' },
      },
    ],
  };
};

/**
 * Format daily orders by type stacked bar chart
 */
export const formatDailyTypeChart = (
  dailyStats: DailyOrderStats[],
): EChartsOption => {
  const dates = dailyStats.map((d) =>
    DateTime.fromISO(d.date).toFormat('MMM dd'),
  );

  const types = Object.keys(ORDER_TYPES);
  const series = types.map((type) => ({
    name: ORDER_TYPES[type] || type,
    type: 'bar' as const,
    stack: 'total',
    data: dailyStats.map((d) => d.by_type?.[type] || 0),
    itemStyle: { color: TYPE_COLORS[type] || '#7e8299' },
  }));

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      bottom: 0,
      left: 'center',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: translate('Orders'),
      minInterval: 1,
    },
    series,
  };
};

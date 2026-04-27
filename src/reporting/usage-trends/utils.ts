import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';

import { generateBrandColors } from '@/core/generateColors';
import { getBrandColor } from '@/core/utils';
import { getChartBrandColor } from '@/dashboard/constants';
import { translate } from '@/i18n';

import {
  MonthlyUsageData,
  YearlyComparison,
  GrowthStats,
  MONTH_NAMES,
} from './types';

/**
 * Get available years for selection (last 5 years)
 */
export const getAvailableYears = (): number[] => {
  const currentYear = DateTime.now().year;
  const years: number[] = [];
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i);
  }
  return years;
};

/**
 * Calculate year-over-year comparison data
 */
export const calculateYearOverYearComparison = (
  currentYearData: MonthlyUsageData[],
  previousYearData: MonthlyUsageData[],
): YearlyComparison[] => {
  const comparison: YearlyComparison[] = [];

  for (let month = 1; month <= 12; month++) {
    const current = currentYearData.find((d) => d.month === month);
    const previous = previousYearData.find((d) => d.month === month);

    const currentUsage = current?.total_usage ?? 0;
    const previousUsage = previous?.total_usage ?? 0;

    const growthPercent =
      previousUsage > 0
        ? ((currentUsage - previousUsage) / previousUsage) * 100
        : currentUsage > 0
          ? 100
          : 0;

    comparison.push({
      month,
      monthName: MONTH_NAMES[month - 1],
      currentYear: currentUsage,
      previousYear: previousUsage,
      growthPercent,
    });
  }

  return comparison;
};

/**
 * Calculate growth statistics
 */
export const calculateGrowthStats = (
  monthlyData: MonthlyUsageData[],
  previousYearData: MonthlyUsageData[],
): GrowthStats => {
  const sortedData = [...monthlyData].sort((a, b) =>
    a.period.localeCompare(b.period),
  );

  const totalUsage = monthlyData.reduce((sum, d) => sum + d.total_usage, 0);
  const previousTotalUsage = previousYearData.reduce(
    (sum, d) => sum + d.total_usage,
    0,
  );

  // Month-over-month growth (last month vs second to last)
  let monthOverMonthGrowth = 0;
  if (sortedData.length >= 2) {
    const lastMonth = sortedData[sortedData.length - 1].total_usage;
    const secondLastMonth = sortedData[sortedData.length - 2].total_usage;
    if (secondLastMonth > 0) {
      monthOverMonthGrowth =
        ((lastMonth - secondLastMonth) / secondLastMonth) * 100;
    }
  }

  // Year-over-year growth
  const yearOverYearGrowth =
    previousTotalUsage > 0
      ? ((totalUsage - previousTotalUsage) / previousTotalUsage) * 100
      : 0;

  // Peak month
  const peakData = monthlyData.reduce(
    (max, d) => (d.total_usage > max.total_usage ? d : max),
    { total_usage: 0, period: '' } as MonthlyUsageData,
  );

  return {
    totalUsage,
    monthOverMonthGrowth,
    yearOverYearGrowth,
    peakMonth: peakData.period
      ? DateTime.fromFormat(peakData.period, 'yyyy-MM').toFormat('MMMM yyyy')
      : '',
    peakUsage: peakData.total_usage,
  };
};

/**
 * Format year-over-year comparison chart
 */
export const formatYearOverYearChart = (
  comparison: YearlyComparison[],
  currentYear: number,
): EChartsOption => {
  const months = comparison.map((c) => c.monthName.slice(0, 3));
  const currentYearData = comparison.map((c) => c.currentYear);
  const previousYearData = comparison.map((c) => c.previousYear);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: [String(currentYear), String(currentYear - 1)],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '15%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: months,
    },
    yAxis: {
      type: 'value',
      name: translate('Usage'),
    },
    series: [
      {
        name: String(currentYear),
        type: 'bar',
        data: currentYearData,
        itemStyle: {
          color: getChartBrandColor(),
        },
      },
      {
        name: String(currentYear - 1),
        type: 'bar',
        data: previousYearData,
        itemStyle: {
          color: generateBrandColors(getBrandColor())['300'],
        },
      },
    ],
  };
};

/**
 * Format monthly usage trend line chart
 */
export const formatUsageTrendChart = (
  monthlyData: MonthlyUsageData[],
): EChartsOption => {
  const sortedData = [...monthlyData].sort((a, b) =>
    a.period.localeCompare(b.period),
  );

  const dates = sortedData.map((d) =>
    DateTime.fromFormat(d.period, 'yyyy-MM').toFormat('MMM yyyy'),
  );
  const usageValues = sortedData.map((d) => d.total_usage);
  const resourceCounts = sortedData.map((d) => d.resource_count);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: [translate('Total usage'), translate('Resource count')],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '15%',
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
    yAxis: [
      {
        type: 'value',
        name: translate('Usage'),
        position: 'left',
      },
      {
        type: 'value',
        name: translate('Resources'),
        position: 'right',
      },
    ],
    series: [
      {
        name: translate('Total usage'),
        type: 'line',
        data: usageValues,
        smooth: true,
        itemStyle: {
          color: getChartBrandColor(),
        },
        areaStyle: {
          color: generateBrandColors(getBrandColor())['300'],
        },
      },
      {
        name: translate('Resource count'),
        type: 'line',
        yAxisIndex: 1,
        data: resourceCounts,
        smooth: true,
        itemStyle: {
          color: '#50cd89',
        },
      },
    ],
  };
};

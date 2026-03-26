import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

import { DailyOrderStats, ORDER_TYPES, TYPE_COLORS } from './types';

interface OrdersDailyTypeChartProps {
  dailyStats: DailyOrderStats[];
}

export const OrdersDailyTypeChart: FC<OrdersDailyTypeChartProps> = ({
  dailyStats,
}) => {
  const chartOptions = useMemo((): EChartsOption => {
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
  }, [dailyStats]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Date'), ...Object.values(ORDER_TYPES)],
      data: dailyStats.map((d) => [
        DateTime.fromISO(d.date).toFormat('MMM dd, yyyy'),
        ...Object.keys(ORDER_TYPES).map((type) => d.by_type?.[type] || 0),
      ]),
    }),
    [dailyStats],
  );

  return (
    <ChartCard
      title={translate('Daily orders by type')}
      getExportData={getExportData}
      isEmpty={!dailyStats.some((d) => d.total > 0)}
    >
      {(ref) => <EChart ref={ref} options={chartOptions} height="300px" />}
    </ChartCard>
  );
};

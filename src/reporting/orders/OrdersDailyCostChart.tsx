import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { getChartBrandColor } from '@waldur/dashboard/constants';
import { translate } from '@waldur/i18n';

import { DailyOrderStats } from './types';

interface OrdersDailyCostChartProps {
  dailyStats: DailyOrderStats[];
}

export const OrdersDailyCostChart: FC<OrdersDailyCostChartProps> = ({
  dailyStats,
}) => {
  const chartOptions = useMemo((): EChartsOption => {
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
          itemStyle: { color: getChartBrandColor() },
        },
      ],
    };
  }, [dailyStats]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Date'), translate('Cost')],
      data: dailyStats.map((d) => [
        DateTime.fromISO(d.date).toFormat('MMM dd, yyyy'),
        d.total_cost || 0,
      ]),
    }),
    [dailyStats],
  );

  return (
    <ChartCard
      title={translate('Daily order cost')}
      getExportData={getExportData}
      isEmpty={
        !dailyStats.some((d) => d.total_cost && parseFloat(d.total_cost) > 0)
      }
    >
      {(ref) => <EChart ref={ref} options={chartOptions} height="300px" />}
    </ChartCard>
  );
};

import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { ChartCard } from '@waldur/reporting/users/charts/ChartCard';

interface MonthlyData {
  month: string;
  customer_count: number;
}

interface CustomerAcquisitionTrendChartProps {
  monthly: MonthlyData[];
}

export const CustomerAcquisitionTrendChart: FC<
  CustomerAcquisitionTrendChartProps
> = ({ monthly }) => {
  const chartOptions = useMemo<EChartsOption>(() => {
    const months = (monthly || []).map((m) =>
      DateTime.fromFormat(m.month, 'yyyy-MM').toFormat('MMM yyyy'),
    );
    const counts = (monthly || []).map((m) => m.customer_count);

    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: 'value',
        name: translate('New customers'),
        minInterval: 1,
      },
      series: [
        {
          name: translate('New customers'),
          type: 'line',
          data: counts,
          smooth: true,
          itemStyle: { color: '#50cd89' },
          areaStyle: { color: 'rgba(80, 205, 137, 0.1)' },
        },
      ],
    };
  }, [monthly]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Month'), translate('New customers')],
      data: (monthly || []).map((m) => [
        DateTime.fromFormat(m.month, 'yyyy-MM').toFormat('MMM yyyy'),
        m.customer_count,
      ]),
    }),
    [monthly],
  );

  return (
    <ChartCard
      title={translate('Customer acquisition trend (12 months)')}
      getExportData={getExportData}
      isEmpty={!monthly || monthly.length === 0}
    >
      {(ref) => <EChart ref={ref} options={chartOptions} height="300px" />}
    </ChartCard>
  );
};

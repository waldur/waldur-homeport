import { EChartsOption } from 'echarts';
import { FC, useCallback, useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { ChartCard } from '@waldur/reporting/users/charts/ChartCard';

interface OfferingStatsData {
  offering_uuid: string;
  offering_name: string;
  revenue: number;
}

interface TopOfferingsByRevenueChartProps {
  offerings: OfferingStatsData[];
}

export const TopOfferingsByRevenueChart: FC<
  TopOfferingsByRevenueChartProps
> = ({ offerings }) => {
  const chartOptions = useMemo<EChartsOption>(() => {
    const data = (offerings || [])
      .filter((o) => o.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const value = params[0].value;
          return `${params[0].name}: ${defaultCurrency(value)}`;
        },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        name: translate('Revenue'),
        axisLabel: { formatter: (value: any) => defaultCurrency(value) },
      },
      yAxis: {
        type: 'category',
        data: data.map((o) => o.offering_name),
        axisLabel: { width: 150, overflow: 'truncate' },
      },
      series: [
        {
          name: translate('Revenue'),
          type: 'bar',
          data: data.map((o) => o.revenue),
          itemStyle: { color: '#50cd89' },
        },
      ],
    };
  }, [offerings]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Offering'), translate('Revenue')],
      data: (offerings || [])
        .sort((a, b) => b.revenue - a.revenue)
        .map((o) => [o.offering_name, o.revenue || 0]),
    }),
    [offerings],
  );

  return (
    <ChartCard
      title={translate('Top offerings by revenue')}
      getExportData={getExportData}
      isEmpty={!offerings || offerings.length === 0}
    >
      {(ref) => <EChart ref={ref} options={chartOptions} height="300px" />}
    </ChartCard>
  );
};

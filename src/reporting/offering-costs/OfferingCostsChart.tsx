import { EChartsOption } from 'echarts';
import { FC, useCallback, useMemo } from 'react';
import { OfferingCost } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { getBrandColor } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

interface OfferingCostsChartProps {
  data: OfferingCost[];
}

export const OfferingCostsChart: FC<OfferingCostsChartProps> = ({ data }) => {
  // Sort by cost descending and take top 10
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.cost - a.cost);
    return sorted.slice(0, 10);
  }, [data]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.cost, 0),
    [data],
  );

  const options = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const param = params[0];
          const percent =
            total > 0 ? ((param.value / total) * 100).toFixed(1) : 0;
          return `${param.name}: ${defaultCurrency(param.value)} (${percent}%)`;
        },
      },
      grid: {
        left: '3%',
        right: '15%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => defaultCurrency(value) ?? '',
        },
      },
      yAxis: {
        type: 'category',
        data: chartData.map((item) => item.offering_name),
        inverse: true,
        axisLabel: {
          width: 150,
          overflow: 'truncate',
        },
      },
      series: [
        {
          type: 'bar',
          data: chartData.map((item) => item.cost),
          itemStyle: {
            color: getBrandColor(),
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => defaultCurrency(params.value) ?? '',
          },
        },
      ],
    }),
    [chartData, total],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Offering'), translate('Cost')],
      data: data.map((item) => [item.offering_name, item.cost]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Top offerings by cost')}
      getExportData={getExportData}
      isEmpty={data.length === 0}
    >
      {(ref) => <EChart ref={ref} options={options} height="400px" />}
    </ChartCard>
  );
};

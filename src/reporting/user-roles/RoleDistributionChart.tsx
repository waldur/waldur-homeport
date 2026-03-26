import { EChartsOption } from 'echarts';
import { FC, useCallback, useMemo } from 'react';
import { CustomerMemberCount } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { EChart } from '@waldur/core/EChart';
import { getBrandColor } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

interface RoleDistributionChartProps {
  data: CustomerMemberCount[];
}

export const RoleDistributionChart: FC<RoleDistributionChartProps> = ({
  data,
}) => {
  // Sort by member count descending and take top 15
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    return sorted.slice(0, 15);
  }, [data]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
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
          return `${param.name}: ${param.value.toLocaleString()} (${percent}%)`;
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
      },
      yAxis: {
        type: 'category',
        data: chartData.map((item) => item.abbreviation || item.name),
        inverse: true,
        axisLabel: {
          width: 150,
          overflow: 'truncate',
        },
      },
      series: [
        {
          type: 'bar',
          data: chartData.map((item) => ({
            value: item.count,
            itemStyle: {
              color: item.has_resources ? getBrandColor() : '#a1a5b7',
            },
          })),
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => params.value.toLocaleString(),
          },
        },
      ],
    }),
    [chartData, total],
  );

  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Organization'),
        translate('Members'),
        translate('Abbreviation'),
      ],
      data: data.map((item) => [
        item.name,
        item.count,
        item.abbreviation || '',
      ]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Members by organization')}
      getExportData={getExportData}
      isEmpty={data.length === 0}
    >
      {(ref) => <EChart ref={ref} options={options} height="500px" />}
    </ChartCard>
  );
};

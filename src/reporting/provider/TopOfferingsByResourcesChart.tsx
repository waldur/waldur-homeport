import { EChartsOption } from 'echarts';
import { FC, useCallback, useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { ChartCard } from '@waldur/reporting/users/charts/ChartCard';

interface OfferingStatsData {
  offering_uuid: string;
  offering_name: string;
  resource_count: number;
}

interface TopOfferingsByResourcesChartProps {
  offerings: OfferingStatsData[];
}

export const TopOfferingsByResourcesChart: FC<
  TopOfferingsByResourcesChartProps
> = ({ offerings }) => {
  const chartOptions = useMemo<EChartsOption>(() => {
    const data = (offerings || [])
      .filter((o) => o.resource_count > 0)
      .sort((a, b) => b.resource_count - a.resource_count)
      .slice(0, 10);

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        name: translate('Resources'),
        minInterval: 1,
      },
      yAxis: {
        type: 'category',
        data: data.map((o) => o.offering_name),
        axisLabel: { width: 150, overflow: 'truncate' },
      },
      series: [
        {
          name: translate('Resources'),
          type: 'bar',
          data: data.map((o) => o.resource_count),
          itemStyle: { color: '#009ef7' },
        },
      ],
    };
  }, [offerings]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Offering'), translate('Resources')],
      data: (offerings || [])
        .sort((a, b) => b.resource_count - a.resource_count)
        .map((o) => [o.offering_name, o.resource_count]),
    }),
    [offerings],
  );

  return (
    <ChartCard
      title={translate('Top offerings by resources')}
      getExportData={getExportData}
      isEmpty={!offerings || offerings.length === 0}
    >
      {(ref) => <EChart ref={ref} options={chartOptions} height="300px" />}
    </ChartCard>
  );
};

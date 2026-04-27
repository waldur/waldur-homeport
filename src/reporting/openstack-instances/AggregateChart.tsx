import { EChartsOption } from 'echarts';
import { FC, useCallback, useMemo } from 'react';
import { OpenStackInstanceAggregate } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { EChart } from '@/core/EChart';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

interface AggregateChartProps {
  data: OpenStackInstanceAggregate[];
}

export const AggregateChart: FC<AggregateChartProps> = ({ data }) => {
  const options = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: [translate('Instance count'), translate('Total cores')],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: (data || []).map((d) =>
          renderFieldOrDash(d.group_label || d.group_key),
        ),
        axisLabel: { rotate: 45, interval: 0 },
      },
      yAxis: [
        {
          type: 'value',
          name: translate('Instances'),
          position: 'left',
        },
        {
          type: 'value',
          name: translate('Cores'),
          position: 'right',
        },
      ],
      series: [
        {
          name: translate('Instance count'),
          type: 'bar',
          data: (data || []).map((d) => d.instance_count),
          itemStyle: { color: '#009ef7' },
        },
        {
          name: translate('Total cores'),
          type: 'bar',
          yAxisIndex: 1,
          data: (data || []).map((d) => d.total_cores),
          itemStyle: { color: '#50cd89' },
        },
      ],
    }),
    [data],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Group'), translate('Instances'), translate('Cores')],
      data: (data || []).map((d) => [
        renderFieldOrDash(d.group_label || d.group_key),
        d.instance_count,
        d.total_cores,
      ]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Instances and cores')}
      getExportData={getExportData}
    >
      {(ref) => <EChart ref={ref} options={options} height="400px" />}
    </ChartCard>
  );
};

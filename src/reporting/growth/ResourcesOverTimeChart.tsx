import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { AreaChart } from '@/reporting/users/charts/AreaChart';

interface ResourcesOverTimeChartProps {
  data: { period: string; resource_count: number }[];
}

export const ResourcesOverTimeChart: FC<ResourcesOverTimeChartProps> = ({
  data,
}) => {
  const chartData = useMemo(() => {
    return (data || []).map((item) => ({
      name: item.period,
      value: item.resource_count,
    }));
  }, [data]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Period'), translate('Resources with usage')],
      data: (data || []).map((item) => [item.period, item.resource_count]),
    }),
    [data],
  );

  return (
    // Counts resources reporting usage per period, not resources in OK state
    // like the "Active resources" tile — the title must not imply otherwise.
    <ChartCard
      title={translate('Resources with reported usage')}
      summary={translate('Latest period: {count}', {
        count: chartData.length ? chartData[chartData.length - 1].value : 0,
      })}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
      chartHeight="160px"
    >
      {(ref) => <AreaChart height="160px" data={chartData} ref={ref} />}
    </ChartCard>
  );
};

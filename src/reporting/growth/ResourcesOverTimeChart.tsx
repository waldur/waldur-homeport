import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { AreaChart } from '@waldur/reporting/users/charts/AreaChart';

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
      fields: [translate('Period'), translate('Count')],
      data: (data || []).map((item) => [item.period, item.resource_count]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Resources over time')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <AreaChart height="160px" data={chartData} ref={ref} />}
    </ChartCard>
  );
};

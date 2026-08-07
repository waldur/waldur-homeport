import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { AreaChart } from '@/reporting/users/charts/AreaChart';

interface ProjectsOverTimeChartProps {
  data: { month: string; count: number }[];
}

export const ProjectsOverTimeChart: FC<ProjectsOverTimeChartProps> = ({
  data,
}) => {
  const chartData = useMemo(() => {
    let accumulated = 0;
    return (data || []).map((item) => {
      accumulated += item.count;
      return {
        name: item.month,
        value: accumulated,
      };
    });
  }, [data]);

  const getExportData = useCallback(() => {
    let accumulated = 0;
    return {
      fields: [translate('Month'), translate('Total')],
      data: (data || []).map((item) => {
        accumulated += item.count;
        return [item.month, accumulated];
      }),
    };
  }, [data]);

  return (
    <ChartCard
      title={translate('Projects over time')}
      summary={translate('Total: {count}', {
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

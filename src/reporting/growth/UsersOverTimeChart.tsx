import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { AreaChart } from '@waldur/reporting/users/charts/AreaChart';

interface UsersOverTimeChartProps {
  data: { month: string; count: number }[];
}

export const UsersOverTimeChart: FC<UsersOverTimeChartProps> = ({ data }) => {
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
      title={translate('Users over time')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <AreaChart height="160px" data={chartData} ref={ref} />}
    </ChartCard>
  );
};

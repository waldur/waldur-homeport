import { FC, useCallback, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { AreaChart } from '@waldur/reporting/users/charts/AreaChart';
import { ChartCard } from '@waldur/reporting/users/charts/ChartCard';

interface UsersOverTimeChartProps {
  data: { month: string; count: number }[];
}

export const UsersOverTimeChart: FC<UsersOverTimeChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return (data || []).map((item) => ({
      name: item.month,
      value: item.count,
    }));
  }, [data]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Month'), translate('Count')],
      data: (data || []).map((item) => [item.month, item.count]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Users over time')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <AreaChart data={chartData} ref={ref} />}
    </ChartCard>
  );
};

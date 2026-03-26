import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { BarChart } from '@waldur/reporting/users/charts/BarChart';

interface ActiveUsersByProviderChartProps {
  data: { customer_name: string; count_users: number }[];
}

export const ActiveUsersByProviderChart: FC<
  ActiveUsersByProviderChartProps
> = ({ data }) => {
  const chartData = useMemo(() => {
    return (data || [])
      .map((item) => ({
        name: item.customer_name,
        value: item.count_users || 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Service provider'), translate('Count')],
      data: (data || [])
        .sort((a, b) => b.count_users - a.count_users)
        .map((item) => [item.customer_name, item.count_users || 0]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Active users per service provider')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <BarChart data={chartData} ref={ref} horizontal />}
    </ChartCard>
  );
};

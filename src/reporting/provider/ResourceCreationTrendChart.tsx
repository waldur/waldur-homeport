import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { AreaChart } from '@waldur/reporting/users/charts/AreaChart';

interface MonthlyData {
  month: string;
  count: number;
}

interface ResourceCreationTrendChartProps {
  monthly: MonthlyData[];
}

export const ResourceCreationTrendChart: FC<
  ResourceCreationTrendChartProps
> = ({ monthly }) => {
  const chartData = useMemo(
    () =>
      (monthly || []).map((m) => ({
        name: DateTime.fromFormat(m.month, 'yyyy-MM').toFormat('MMM yyyy'),
        value: m.count,
      })),
    [monthly],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Month'), translate('New resources')],
      data: (monthly || []).map((m) => [
        DateTime.fromFormat(m.month, 'yyyy-MM').toFormat('MMM yyyy'),
        m.count,
      ]),
    }),
    [monthly],
  );

  return (
    <ChartCard
      title={translate('Resource creation trend (12 months)')}
      getExportData={getExportData}
      isEmpty={!monthly || monthly.length === 0}
    >
      {(ref) => <AreaChart ref={ref} data={chartData} height="300px" />}
    </ChartCard>
  );
};

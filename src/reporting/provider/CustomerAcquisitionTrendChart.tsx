import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { AreaChart } from '@/reporting/users/charts/AreaChart';

interface MonthlyData {
  month: string;
  customer_count: number;
}

interface CustomerAcquisitionTrendChartProps {
  monthly: MonthlyData[];
}

export const CustomerAcquisitionTrendChart: FC<
  CustomerAcquisitionTrendChartProps
> = ({ monthly }) => {
  const chartData = useMemo(
    () =>
      (monthly || []).map((m) => ({
        name: DateTime.fromFormat(m.month, 'yyyy-MM').toFormat('MMM yyyy'),
        value: m.customer_count,
      })),
    [monthly],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Month'), translate('New customers')],
      data: (monthly || []).map((m) => [
        DateTime.fromFormat(m.month, 'yyyy-MM').toFormat('MMM yyyy'),
        m.customer_count,
      ]),
    }),
    [monthly],
  );

  return (
    <ChartCard
      title={translate('Customer acquisition trend (12 months)')}
      getExportData={getExportData}
      isEmpty={!monthly || monthly.length === 0}
    >
      {(ref) => <AreaChart ref={ref} data={chartData} height="300px" />}
    </ChartCard>
  );
};

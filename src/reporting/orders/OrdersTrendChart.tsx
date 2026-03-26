import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { BarChart } from '@waldur/reporting/users/charts/BarChart';

import { DailyOrderStats } from './types';

interface OrdersTrendChartProps {
  dailyStats: DailyOrderStats[];
}

export const OrdersTrendChart: FC<OrdersTrendChartProps> = ({ dailyStats }) => {
  const chartData = useMemo(
    () =>
      dailyStats.map((d) => ({
        name: DateTime.fromISO(d.date).toFormat('MMM dd'),
        value: d.total,
      })),
    [dailyStats],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Date'), translate('Orders')],
      data: dailyStats.map((d) => [
        DateTime.fromISO(d.date).toFormat('MMM dd, yyyy'),
        d.total,
      ]),
    }),
    [dailyStats],
  );

  return (
    <ChartCard
      title={translate('Daily order volume')}
      getExportData={getExportData}
      isEmpty={dailyStats.length === 0}
    >
      {(ref) => (
        <BarChart ref={ref} data={chartData} isSorted={false} height="300px" />
      )}
    </ChartCard>
  );
};

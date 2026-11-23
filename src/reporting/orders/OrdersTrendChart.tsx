import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { formatDate, formatDayMonth } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { BarChart } from '@/reporting/users/charts/BarChart';

import { DailyOrderStats } from './types';

interface OrdersTrendChartProps {
  dailyStats: DailyOrderStats[];
}

export const OrdersTrendChart: FC<OrdersTrendChartProps> = ({ dailyStats }) => {
  const chartData = useMemo(
    () =>
      dailyStats.map((d) => ({
        name: formatDayMonth(DateTime.fromISO(d.date)),
        value: d.total,
      })),
    [dailyStats],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Date'), translate('Orders')],
      data: dailyStats.map((d) => [
        formatDate(DateTime.fromISO(d.date)),
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

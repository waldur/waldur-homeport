import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { DonutChart } from '@/reporting/users/charts/DonutChart';

import { ORDER_STATES, STATE_COLORS } from './types';

interface OrdersStateChartProps {
  stateStats: Record<string, number>;
}

export const OrdersStateChart: FC<OrdersStateChartProps> = ({ stateStats }) => {
  const chartData = useMemo(
    () =>
      Object.entries(stateStats)
        .filter(([, value]) => value > 0)
        .map(([state, value]) => ({
          name: ORDER_STATES[state] || state,
          value,
          itemStyle: {
            color: STATE_COLORS[state] || '#7e8299',
          },
        })),
    [stateStats],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('State'), translate('Count')],
      data: Object.entries(stateStats).map(([state, count]) => [
        ORDER_STATES[state] || state,
        count,
      ]),
    }),
    [stateStats],
  );

  return (
    <ChartCard
      title={translate('Orders by state')}
      getExportData={getExportData}
      isEmpty={Object.values(stateStats).every((v) => v === 0)}
    >
      {(ref) => <DonutChart ref={ref} data={chartData} height="300px" />}
    </ChartCard>
  );
};

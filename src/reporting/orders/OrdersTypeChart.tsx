import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { DonutChart } from '@waldur/reporting/users/charts/DonutChart';

import { ORDER_TYPES, TYPE_COLORS } from './types';

interface OrdersTypeChartProps {
  typeStats: Record<string, number>;
}

export const OrdersTypeChart: FC<OrdersTypeChartProps> = ({ typeStats }) => {
  const chartData = useMemo(
    () =>
      Object.entries(typeStats)
        .filter(([, value]) => value > 0)
        .map(([type, value]) => ({
          name: ORDER_TYPES[type] || type,
          value,
          itemStyle: {
            color: TYPE_COLORS[type] || '#7e8299',
          },
        })),
    [typeStats],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Type'), translate('Count')],
      data: Object.entries(typeStats).map(([type, count]) => [
        ORDER_TYPES[type] || type,
        count,
      ]),
    }),
    [typeStats],
  );

  return (
    <ChartCard
      title={translate('Orders by type')}
      getExportData={getExportData}
      isEmpty={Object.values(typeStats).every((v) => v === 0)}
    >
      {(ref) => <DonutChart ref={ref} data={chartData} height="300px" />}
    </ChartCard>
  );
};

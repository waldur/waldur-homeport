import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { getChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';
import { DonutChart } from '@/reporting/users/charts/DonutChart';

import { ORDER_TYPES, getTypeColors } from './types';

interface OrdersTypeChartProps {
  typeStats: Record<string, number>;
}

export const OrdersTypeChart: FC<OrdersTypeChartProps> = ({ typeStats }) => {
  const chartData = useMemo(() => {
    const colors = getTypeColors();
    return Object.entries(typeStats)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => ({
        name: ORDER_TYPES[type] || type,
        value,
        itemStyle: {
          color: colors[type] || getChartThemeColors().muted,
        },
      }));
  }, [typeStats]);

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

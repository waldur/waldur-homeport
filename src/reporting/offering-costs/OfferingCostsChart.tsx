import { FC, useCallback, useMemo } from 'react';
import { OfferingCost } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { BarChart, BarChartItem } from '../users/charts/BarChart';

interface OfferingCostsChartProps {
  data: OfferingCost[];
}

export const OfferingCostsChart: FC<OfferingCostsChartProps> = ({ data }) => {
  const chartData = useMemo<BarChartItem[]>(() => {
    const sorted = [...data].sort((a, b) => b.cost - a.cost);
    return sorted.slice(0, 10).map((item) => ({
      name: item.offering_name,
      value: item.cost,
    }));
  }, [data]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.cost, 0),
    [data],
  );

  const valueFormatter = useCallback(
    (value: number) => defaultCurrency(value) ?? '',
    [],
  );

  const labelFormatter = useCallback(
    (params: any) => defaultCurrency(params.value) ?? '',
    [],
  );

  const tooltipFormatter = useCallback(
    (params: any) => {
      const param = params[0];
      const percent = total > 0 ? ((param.value / total) * 100).toFixed(1) : 0;
      return `${param.name}: ${defaultCurrency(param.value)} (${percent}%)`;
    },
    [total],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Offering'), translate('Cost')],
      data: data.map((item) => [item.offering_name, item.cost]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Top offerings by cost')}
      getExportData={getExportData}
      isEmpty={data.length === 0}
    >
      {(ref) => (
        <BarChart
          ref={ref}
          data={chartData}
          horizontal
          showValueLabel
          valueFormatter={valueFormatter}
          labelFormatter={labelFormatter}
          tooltipFormatter={tooltipFormatter}
          height="400px"
        />
      )}
    </ChartCard>
  );
};

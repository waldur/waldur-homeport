import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';
import { ServiceProviderRevenues } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { ChartCard } from '@waldur/reporting/users/charts/ChartCard';

interface ProviderRevenueChartProps {
  data: ServiceProviderRevenues[];
}

export const ProviderRevenueChart: FC<ProviderRevenueChartProps> = ({
  data,
}) => {
  const chartOptions = useMemo<EChartsOption>(() => {
    const months = (data || []).map((d) =>
      DateTime.fromObject({ year: d.year, month: d.month }).toFormat(
        'MMM yyyy',
      ),
    );
    const values = (data || []).map((d) => d.total || 0);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const value = params[0].value;
          return `${params[0].name}: ${defaultCurrency(value)}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: 'value',
        name: translate('Revenue'),
        axisLabel: {
          formatter: (value: any) => defaultCurrency(value),
        },
      },
      series: [
        {
          name: translate('Revenue'),
          type: 'bar',
          data: values,
          itemStyle: { color: '#50cd89' },
        },
      ],
    };
  }, [data]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Month'), translate('Revenue')],
      data: (data || []).map((d) => [
        DateTime.fromObject({ year: d.year, month: d.month }).toFormat(
          'MMM yyyy',
        ),
        d.total || 0,
      ]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Revenue trend (12 months)')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <EChart ref={ref} options={chartOptions} height="400px" />}
    </ChartCard>
  );
};

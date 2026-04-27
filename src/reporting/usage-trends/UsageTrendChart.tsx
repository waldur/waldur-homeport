import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { EChart } from '@/core/EChart';
import { translate } from '@/i18n';

import { MonthlyUsageData } from './types';
import { formatUsageTrendChart } from './utils';

interface UsageTrendChartProps {
  monthlyData: MonthlyUsageData[];
  year: number;
}

export const UsageTrendChart: FC<UsageTrendChartProps> = ({
  monthlyData,
  year,
}) => {
  const chartOptions = useMemo(
    () => formatUsageTrendChart(monthlyData),
    [monthlyData],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Month'), translate('Usage'), translate('Resources')],
      data: (monthlyData || []).map((d) => [
        DateTime.fromFormat(d.period, 'yyyy-MM').toFormat('MMMM yyyy'),
        d.total_usage,
        d.resource_count,
      ]),
    }),
    [monthlyData],
  );

  return (
    <ChartCard
      title={translate('Monthly usage trend ({year})', { year })}
      getExportData={getExportData}
    >
      {(ref) => <EChart ref={ref} options={chartOptions} height="350px" />}
    </ChartCard>
  );
};

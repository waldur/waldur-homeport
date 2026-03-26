import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';

import { UserRegistrationTrend } from '../types';

import { AreaChart } from './AreaChart';
import { getChartExportData } from './utils';

interface RegistrationTrendChartProps {
  data: UserRegistrationTrend[];
}

/**
 * Format month string to display format
 */
function formatMonth(month: string): string {
  const date = DateTime.fromFormat(month, 'yyyy-MM');
  if (date.isValid) {
    return date.toFormat('MMM yyyy');
  }
  return month;
}

export const RegistrationTrendChart: FC<RegistrationTrendChartProps> = ({
  data,
}) => {
  const chartData = useMemo(
    () =>
      [...(data || [])]
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((item) => ({
          name: formatMonth(item.month),
          value: item.count,
        })),
    [data],
  );

  const getExportData = useCallback(
    () => getChartExportData(translate('Month'), chartData),
    [chartData],
  );

  return (
    <ChartCard
      title={translate('Registration trend')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <AreaChart ref={ref} data={chartData} showPoints={true} />}
    </ChartCard>
  );
};

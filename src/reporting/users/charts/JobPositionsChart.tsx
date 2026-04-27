import { FC, useCallback, useMemo } from 'react';
import { UserJobTitleCount } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';

import { DonutChart } from './DonutChart';
import { getChartExportData } from './utils';

interface JobPositionsChartProps {
  data: UserJobTitleCount[];
}

/**
 * Chart displaying user distribution by job title/position
 */
export const JobPositionsChart: FC<JobPositionsChartProps> = ({ data }) => {
  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        name: item.job_title || translate('Not specified'),
        value: item.count,
      })),
    [data],
  );

  const getExportData = useCallback(
    () => getChartExportData(translate('Job position'), chartData),
    [chartData],
  );

  return (
    <ChartCard
      title={translate('Job positions')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <DonutChart ref={ref} data={chartData} />}
    </ChartCard>
  );
};

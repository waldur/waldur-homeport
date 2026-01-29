import { FC, useMemo } from 'react';

import { translate } from '@waldur/i18n';

import { UserJobTitleCount } from '../types';

import { DonutChart } from './DonutChart';

interface JobPositionsChartProps {
  data: UserJobTitleCount[];
}

/**
 * Chart displaying user distribution by job title/position
 */
export const JobPositionsChart: FC<JobPositionsChartProps> = ({ data }) => {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        name: item.job_title || translate('Not specified'),
        value: item.count,
      })),
    [data],
  );

  return (
    <DonutChart title={translate('Users by job position')} data={chartData} />
  );
};

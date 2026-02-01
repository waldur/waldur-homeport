import { FC, useMemo } from 'react';
import { OfferingCountryStats } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { DonutChart } from '../users/charts/DonutChart';

interface ResourcesByCountryChartProps {
  data: OfferingCountryStats[];
}

export const ResourcesByCountryChart: FC<ResourcesByCountryChartProps> = ({
  data,
}) => {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        name: item.country || translate('Unknown'),
        value: item.count,
      })),
    [data],
  );

  return (
    <DonutChart title={translate('Resources by country')} data={chartData} />
  );
};

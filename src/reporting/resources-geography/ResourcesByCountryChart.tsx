import { FC, useCallback, useMemo } from 'react';
import { OfferingCountryStats } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { DonutChart } from '@waldur/reporting/users/charts/DonutChart';

interface ResourcesByCountryChartProps {
  data: OfferingCountryStats[];
}

export const ResourcesByCountryChart: FC<ResourcesByCountryChartProps> = ({
  data,
}) => {
  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        name: item.country || translate('Unknown'),
        value: item.count,
      })),
    [data],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Country'), translate('Count')],
      data: (data || []).map((item) => [
        item.country || translate('Unknown'),
        item.count || 0,
      ]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Resources by country')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <DonutChart data={chartData} ref={ref} />}
    </ChartCard>
  );
};

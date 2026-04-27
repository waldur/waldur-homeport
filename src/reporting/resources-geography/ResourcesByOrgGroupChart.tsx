import { FC, useCallback, useMemo } from 'react';
import { CountStats } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { BarChart } from '@/reporting/users/charts/BarChart';

interface ResourcesByOrgGroupChartProps {
  data: CountStats[];
}

export const ResourcesByOrgGroupChart: FC<ResourcesByOrgGroupChartProps> = ({
  data,
}) => {
  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        name: item.name,
        value: item.count,
      })),
    [data],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Organization group'), translate('Count')],
      data: (data || []).map((item) => [item.name, item.count]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Resources by organization group')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <BarChart data={chartData} ref={ref} horizontal />}
    </ChartCard>
  );
};

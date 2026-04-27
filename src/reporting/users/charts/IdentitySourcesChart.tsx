import { FC, useCallback, useMemo } from 'react';
import { UserIdentitySourceCount } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';

import { DonutChart } from './DonutChart';
import { getChartExportData } from './utils';

interface IdentitySourcesChartProps {
  data: UserIdentitySourceCount[];
}

export const IdentitySourcesChart: FC<IdentitySourcesChartProps> = ({
  data,
}) => {
  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        name: item.identity_source || translate('Unknown'),
        value: item.count,
      })),
    [data],
  );

  const getExportData = useCallback(
    () => getChartExportData(translate('Identity source'), chartData),
    [chartData],
  );

  return (
    <ChartCard
      title={translate('Identity sources')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <DonutChart ref={ref} data={chartData} />}
    </ChartCard>
  );
};

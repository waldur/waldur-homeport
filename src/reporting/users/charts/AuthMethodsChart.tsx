import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';

import { UserAuthMethodCount } from '../types';

import { DonutChart } from './DonutChart';
import { getChartExportData } from './utils';

interface AuthMethodsChartProps {
  data: UserAuthMethodCount[];
}

export const AuthMethodsChart: FC<AuthMethodsChartProps> = ({ data }) => {
  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        name: item.method || translate('Unknown'),
        value: item.count,
      })),
    [data],
  );

  const getExportData = useCallback(
    () => getChartExportData(translate('Authentication method'), chartData),
    [chartData],
  );

  return (
    <ChartCard
      title={translate('Authentication methods')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <DonutChart ref={ref} data={chartData} />}
    </ChartCard>
  );
};

import { FC, useCallback, useMemo } from 'react';
import { UserActiveStatusCount } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { getChartBrandColor } from '@waldur/dashboard/constants';
import { translate } from '@waldur/i18n';

import { DonutChart } from './DonutChart';
import { getChartExportData } from './utils';

interface ActiveStatusChartProps {
  data: UserActiveStatusCount[];
}

export const ActiveStatusChart: FC<ActiveStatusChartProps> = ({ data }) => {
  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        name:
          item.status === 'active'
            ? translate('Active')
            : translate('Inactive'),
        value: item.count,
        itemStyle: {
          color: item.status === 'active' ? getChartBrandColor() : '#d0d5dd', // gray-300
        },
      })),
    [data],
  );

  const getExportData = useCallback(
    () => getChartExportData(translate('Status'), chartData),
    [chartData],
  );

  return (
    <ChartCard
      title={translate('Active status')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <DonutChart ref={ref} data={chartData} />}
    </ChartCard>
  );
};

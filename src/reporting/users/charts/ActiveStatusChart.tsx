import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { generateBrandColors } from '@waldur/core/generateColors';
import { getBrandColor } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { UserActiveStatusCount } from '../types';

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
          color:
            item.status === 'active'
              ? getBrandColor()
              : generateBrandColors(getBrandColor())[300],
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

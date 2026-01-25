import { FC, useMemo } from 'react';

import { translate } from '@waldur/i18n';

import { UserActiveStatusCount } from '../types';

import { DonutChart } from './DonutChart';

interface ActiveStatusChartProps {
  data: UserActiveStatusCount[];
}

export const ActiveStatusChart: FC<ActiveStatusChartProps> = ({ data }) => {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        name:
          item.status === 'active'
            ? translate('Active')
            : translate('Inactive'),
        value: item.count,
        itemStyle: {
          color: item.status === 'active' ? '#50cd89' : '#f1416c',
        },
      })),
    [data],
  );

  return <DonutChart title={translate('User status')} data={chartData} />;
};

import { FC, useMemo } from 'react';

import { translate } from '@waldur/i18n';

import { UserAuthMethodCount } from '../types';

import { DonutChart } from './DonutChart';

interface AuthMethodsChartProps {
  data: UserAuthMethodCount[];
}

export const AuthMethodsChart: FC<AuthMethodsChartProps> = ({ data }) => {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        name: item.method || translate('Unknown'),
        value: item.count,
      })),
    [data],
  );

  return (
    <DonutChart title={translate('Authentication methods')} data={chartData} />
  );
};

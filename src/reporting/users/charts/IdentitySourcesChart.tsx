import { FC, useMemo } from 'react';

import { translate } from '@waldur/i18n';

import { UserIdentitySourceCount } from '../types';

import { DonutChart } from './DonutChart';

interface IdentitySourcesChartProps {
  data: UserIdentitySourceCount[];
}

export const IdentitySourcesChart: FC<IdentitySourcesChartProps> = ({
  data,
}) => {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        name: item.identity_source || translate('Unknown'),
        value: item.count,
      })),
    [data],
  );

  return (
    <DonutChart title={translate('Identity providers')} data={chartData} />
  );
};

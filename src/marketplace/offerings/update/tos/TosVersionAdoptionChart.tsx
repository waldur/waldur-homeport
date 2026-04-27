import { FC } from 'react';
import type { ToSConsentDashboard } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { translate } from '@/i18n';

import { formatVersionAdoptionChart } from './utils';

interface TosVersionAdoptionChartProps {
  data: ToSConsentDashboard;
}

export const TosVersionAdoptionChart: FC<TosVersionAdoptionChartProps> = ({
  data,
}) => {
  const chartOptions = formatVersionAdoptionChart(data.tos_version_adoption);

  return (
    <div
      className="border border-secondary rounded"
      style={{ padding: '16px' }}
    >
      <h6 className="mb-3">{translate('ToS version adoption')}</h6>
      <EChart options={chartOptions} height="250px" />
    </div>
  );
};

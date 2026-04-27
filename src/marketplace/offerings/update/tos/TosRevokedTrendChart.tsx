import { FC } from 'react';
import type { ToSConsentDashboard } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { translate } from '@/i18n';

import { formatRevokedTrendChart } from './utils';

interface TosRevokedTrendChartProps {
  data: ToSConsentDashboard;
}

export const TosRevokedTrendChart: FC<TosRevokedTrendChartProps> = ({
  data,
}) => {
  const chartOptions = formatRevokedTrendChart(data.revoked_consents_over_time);

  return (
    <div
      className="border border-secondary rounded"
      style={{ padding: '16px' }}
    >
      <h6 className="mb-3">{translate('Revoked consents over time')}</h6>
      <EChart options={chartOptions} height="250px" />
    </div>
  );
};

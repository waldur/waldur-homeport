import { FC } from 'react';
import type { ToSConsentDashboard } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { translate } from '@/i18n';

import { formatAcceptedTrendChart } from './utils';

interface TosAcceptedTrendChartProps {
  data: ToSConsentDashboard;
}

export const TosAcceptedTrendChart: FC<TosAcceptedTrendChartProps> = ({
  data,
}) => {
  // Note: accepted_consents_over_time is a new field not yet in the type definition
  const chartOptions = formatAcceptedTrendChart(
    (data as any).accepted_consents_over_time || [],
  );

  return (
    <div
      className="border border-secondary rounded"
      style={{ padding: '16px' }}
    >
      <h6 className="mb-3">{translate('Accepted consents over time')}</h6>
      <EChart options={chartOptions} height="250px" />
    </div>
  );
};

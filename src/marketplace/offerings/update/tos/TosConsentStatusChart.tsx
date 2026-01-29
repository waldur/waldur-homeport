import { FC } from 'react';
import type { ToSConsentDashboard } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

import { formatConsentStatusChart } from './utils';

interface TosConsentStatusChartProps {
  data: ToSConsentDashboard;
}

export const TosConsentStatusChart: FC<TosConsentStatusChartProps> = ({
  data,
}) => {
  const chartOptions = formatConsentStatusChart(data);

  return (
    <div
      className="border border-secondary rounded"
      style={{ padding: '16px' }}
    >
      <h6 className="mb-3">{translate('Consent status breakdown')}</h6>
      <EChart options={chartOptions} height="250px" />
    </div>
  );
};

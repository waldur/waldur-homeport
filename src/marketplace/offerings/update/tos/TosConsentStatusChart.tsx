import { FC } from 'react';
import type { ToSConsentDashboard } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { renderFieldOrDash } from '@waldur/table/utils';

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
      <div className="text-muted mb-3">
        {translate('Total users')}: {renderFieldOrDash(data.total_users_count)}
      </div>
      <EChart options={chartOptions} height="250px" />
    </div>
  );
};

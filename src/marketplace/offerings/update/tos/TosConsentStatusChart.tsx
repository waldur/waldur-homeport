import { FC } from 'react';
import type { ToSConsentDashboard } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

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
      className="border-[1px] border-secondary rounded"
      style={{ padding: '16px' }}
    >
      <h6 className="mb-2.5">{translate('Consent status breakdown')}</h6>
      <div className="text-quaternary mb-2.5">
        {translate('Total users')}: {renderFieldOrDash(data.total_users_count)}
      </div>
      <EChart options={chartOptions} height="250px" />
    </div>
  );
};

import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { StatCardGrid } from 'waldur-ui';

import { translate } from '@/i18n';

import type { TableGrowthStatsResponse } from './api';
import type { TableAlert } from './utils';

interface TableGrowthOverviewProps {
  data: TableGrowthStatsResponse;
  alerts: TableAlert[];
}

export const TableGrowthOverview: FC<TableGrowthOverviewProps> = ({
  data,
  alerts,
}) => (
  <StatCardGrid
    className="mb-5"
    spaceless
    stats={[
      { label: translate('Date'), value: data.date },
      { label: translate('Tables monitored'), value: data.tables.length },
      {
        label: translate('Active alerts'),
        value: alerts.length,
        tone: alerts.length > 0 ? 'danger' : 'success',
        icon:
          alerts.length > 0 ? (
            <WarningCircleIcon
              size={20}
              weight="bold"
              className="text-danger"
            />
          ) : undefined,
      },
      {
        label: translate('Thresholds (weekly / monthly)'),
        value: `${data.weekly_threshold_percent}% / ${data.monthly_threshold_percent}%`,
      },
    ]}
  />
);

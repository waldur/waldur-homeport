import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@/i18n';

import type { TableGrowthStatsResponse } from './api';
import type { TableAlert } from './utils';

interface TableGrowthOverviewProps {
  data: TableGrowthStatsResponse;
  alerts: TableAlert[];
}

const StatCard: FC<{
  value: ReactNode;
  label: string;
  valueClass?: string;
  extra?: ReactNode;
}> = ({ value, label, valueClass = '', extra }) => (
  <Card className="card-bordered mb-4 h-full">
    <Card.Body>
      <div className="flex items-center">
        <strong className={`text-2xl ${valueClass}`}>{value}</strong>
        {extra}
      </div>
      <strong className="block text-quaternary">{label}</strong>
    </Card.Body>
  </Card>
);

export const TableGrowthOverview: FC<TableGrowthOverviewProps> = ({
  data,
  alerts,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 mb-5">
      <div>
        <StatCard value={data.date} label={translate('Date')} />
      </div>

      <div>
        <StatCard
          value={data.tables.length}
          label={translate('Tables monitored')}
        />
      </div>

      <div>
        <StatCard
          value={alerts.length}
          label={translate('Active alerts')}
          valueClass={alerts.length > 0 ? 'text-danger' : 'text-success'}
          extra={
            alerts.length > 0 ? (
              <WarningCircleIcon
                size={24}
                weight="bold"
                className="text-danger ms-1.5"
              />
            ) : null
          }
        />
      </div>

      <div>
        <StatCard
          value={`${data.weekly_threshold_percent}% / ${data.monthly_threshold_percent}%`}
          label={translate('Thresholds (weekly / monthly)')}
        />
      </div>
    </div>
  );
};

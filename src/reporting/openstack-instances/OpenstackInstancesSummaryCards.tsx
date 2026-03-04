import { FC } from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

interface SummaryData {
  totalInstances: number;
  activeInstances: number;
  totalCores: number;
  totalRamMb: number;
  totalDiskMb: number;
}

interface SummaryCardProps {
  title: string;
  value: number | string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const SummaryCard: FC<SummaryCardProps> = ({
  title,
  value,
  variant = 'primary',
}) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-light-primary text-primary',
    success: 'bg-light-success text-success',
    warning: 'bg-light-warning text-warning',
    danger: 'bg-light-danger text-danger',
    info: 'bg-light-info text-info',
  };

  return (
    <div className="col-sm-6 col-xl-2">
      <div className={`card card-flush h-100 ${colorClasses[variant]}`}>
        <div className="card-body py-5">
          <div className="fs-4 fw-bold mb-2">{title}</div>
          <div className="fs-2hx fw-bolder">{value}</div>
        </div>
      </div>
    </div>
  );
};

interface OpenstackInstancesSummaryCardsProps {
  summary: SummaryData;
}

export const OpenstackInstancesSummaryCards: FC<
  OpenstackInstancesSummaryCardsProps
> = ({ summary }) => (
  <div className="row g-5 mb-6">
    <SummaryCard
      title={translate('Total instances')}
      value={summary.totalInstances}
    />
    <SummaryCard
      title={translate('Active instances')}
      value={summary.activeInstances}
    />
    <SummaryCard title={translate('Total vCPUs')} value={summary.totalCores} />
    <SummaryCard
      title={translate('Total RAM')}
      value={formatFilesize(summary.totalRamMb)}
    />
    <SummaryCard
      title={translate('Total disk')}
      value={formatFilesize(summary.totalDiskMb)}
    />
  </div>
);

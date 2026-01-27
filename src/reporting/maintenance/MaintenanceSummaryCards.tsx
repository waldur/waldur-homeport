import { FC } from 'react';
import { MaintenanceStatsResponse } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';

interface MaintenanceSummaryCardsProps {
  stats: MaintenanceStatsResponse;
}

interface SummaryCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const SummaryCard: FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
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
          {subtitle && <div className="fs-7 text-muted mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
};

export const MaintenanceSummaryCards: FC<MaintenanceSummaryCardsProps> = ({
  stats,
}) => {
  const { summary } = stats;

  const formatDuration = (hours: number | null): string => {
    if (hours === null) return '-';
    if (hours < 1) {
      return formatJsxTemplate(translate('{minutes} min'), {
        minutes: Math.round(hours * 60),
      }) as string;
    }
    if (hours < 24) {
      return formatJsxTemplate(translate('{hours} h'), {
        hours: hours.toFixed(1),
      }) as string;
    }
    const days = hours / 24;
    return formatJsxTemplate(translate('{days} d'), {
      days: days.toFixed(1),
    }) as string;
  };

  const formatRate = (rate: number | null): string => {
    if (rate === null) return '-';
    return `${rate.toFixed(0)}%`;
  };

  return (
    <div className="row g-5 mb-6">
      <SummaryCard
        title={translate('Total')}
        value={summary.total}
        variant="primary"
      />
      <SummaryCard
        title={translate('Active')}
        value={summary.active}
        subtitle={translate('In progress')}
        variant="info"
      />
      <SummaryCard
        title={translate('Scheduled')}
        value={summary.scheduled}
        subtitle={translate('Upcoming')}
        variant="warning"
      />
      <SummaryCard
        title={translate('Completed')}
        value={summary.completed}
        variant="success"
      />
      <SummaryCard
        title={translate('Avg duration')}
        value={formatDuration(summary.average_duration_hours)}
        variant="primary"
      />
      <SummaryCard
        title={translate('On-time rate')}
        value={formatRate(summary.on_time_completion_rate)}
        variant={
          summary.on_time_completion_rate === null
            ? 'primary'
            : summary.on_time_completion_rate >= 90
              ? 'success'
              : summary.on_time_completion_rate >= 70
                ? 'warning'
                : 'danger'
        }
      />
    </div>
  );
};

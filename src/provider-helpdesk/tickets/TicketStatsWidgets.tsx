import { FC, ReactNode } from 'react';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { useProviderTicketsStats } from '../api';

const StatCard: FC<{ label: string; value: ReactNode }> = ({
  label,
  value,
}) => (
  <div className="col-6 col-md">
    <div className="card card-bordered h-100">
      <div className="card-body py-3 text-center">
        <div className="fs-3 fw-bold">{value}</div>
        <div className="text-muted small">{label}</div>
      </div>
    </div>
  </div>
);

/** Summary stat cards shown above the provider tickets list. */
export const TicketStatsWidgets: FC = () => {
  const { data: stats } = useProviderTicketsStats();
  if (!stats) {
    return null;
  }
  return (
    <div className="row g-3 mb-4">
      <StatCard label={translate('Open')} value={stats.total_open} />
      <StatCard label={translate('Resolved')} value={stats.total_resolved} />
      <StatCard label={translate('Escalated')} value={stats.total_escalated} />
      <StatCard
        label={translate('SLA breaches')}
        value={stats.sla_breach_count}
      />
      <StatCard
        label={translate('Avg resolution (h)')}
        value={
          stats.avg_resolution_hours != null
            ? Math.round(stats.avg_resolution_hours)
            : renderFieldOrDash(null)
        }
      />
    </div>
  );
};

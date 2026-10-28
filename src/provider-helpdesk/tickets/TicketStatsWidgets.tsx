import { FC, ReactNode } from 'react';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { useProviderTicketsStats } from '../api';

const StatCard: FC<{ label: string; value: ReactNode }> = ({
  label,
  value,
}) => (
  <div className="card card-bordered h-full">
    <div className="card-body py-2.5 text-center">
      <div className="text-lg font-medium">{value}</div>
      <div className="text-quaternary small">{label}</div>
    </div>
  </div>
);

/** Summary stat cards shown above the provider tickets list. */
export const TicketStatsWidgets: FC<{ helpdeskUuid?: string }> = ({
  helpdeskUuid,
}) => {
  const { data: stats } = useProviderTicketsStats(helpdeskUuid);
  if (!stats) {
    return null;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-3">
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

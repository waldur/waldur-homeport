import { FC } from 'react';

import { StatCardGrid } from 'waldur-ui';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { useProviderTicketsStats } from '../api';

/** Summary stat cards shown above the provider tickets list. */
export const TicketStatsWidgets: FC<{ helpdeskUuid?: string }> = ({
  helpdeskUuid,
}) => {
  const { data: stats } = useProviderTicketsStats(helpdeskUuid);
  if (!stats) {
    return null;
  }
  return (
    <StatCardGrid
      stats={[
        { label: translate('Open'), value: stats.total_open },
        { label: translate('Resolved'), value: stats.total_resolved },
        { label: translate('Escalated'), value: stats.total_escalated },
        { label: translate('SLA breaches'), value: stats.sla_breach_count },
        {
          label: translate('Avg resolution (h)'),
          value:
            stats.avg_resolution_hours != null
              ? Math.round(stats.avg_resolution_hours)
              : renderFieldOrDash(null),
        },
      ]}
    />
  );
};

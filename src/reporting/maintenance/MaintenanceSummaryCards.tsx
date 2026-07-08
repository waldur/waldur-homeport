import { FC, useMemo } from 'react';
import { MaintenanceStatsResponse } from 'waldur-js-client';

import { SummaryWidget } from '@/core/SummaryWidget';
import { formatJsxTemplate, translate } from '@/i18n';

interface MaintenanceSummaryCardsProps {
  stats: MaintenanceStatsResponse;
}

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

  const statsList = useMemo(
    () => [
      {
        label: translate('Total'),
        value: summary.total,
      },
      {
        label: translate('Active'),
        value: summary.active,
      },
      {
        label: translate('Scheduled'),
        value: summary.scheduled,
      },
      {
        label: translate('Completed'),
        value: summary.completed,
      },
      {
        label: translate('Avg duration'),
        value: formatDuration(summary.average_duration_hours),
      },
      {
        label: translate('On-time rate'),
        value: formatRate(summary.on_time_completion_rate),
      },
      {
        label: translate('On time (±15 min)'),
        value: formatRate(
          summary.on_time_rate_15min !== null
            ? summary.on_time_rate_15min * 100
            : null,
        ),
      },
      {
        label: translate('Avg overrun'),
        value: formatDuration(summary.avg_overrun_hours),
      },
      {
        label: translate('Emergency'),
        value: summary.emergency_count,
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={statsList} />;
};

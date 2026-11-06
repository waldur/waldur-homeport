import { CeleryStatsResponse } from 'waldur-js-client';

import { StatCardGrid } from 'waldur-ui';

import { translate } from '@/i18n';

interface CeleryOverviewCardsProps {
  data: CeleryStatsResponse;
}

const countTasks = (tasksByWorker: Record<string, unknown[]> | null): number =>
  tasksByWorker
    ? Object.values(tasksByWorker).reduce((sum, tasks) => sum + tasks.length, 0)
    : 0;

const countTotalProcessed = (
  stats: CeleryStatsResponse['stats'],
): number | undefined => {
  if (!stats) return undefined;
  const workerStats = Object.values(stats)[0];
  if (!workerStats?.total) return undefined;
  return Object.values(workerStats.total).reduce<number>(
    (sum, count) => sum + (count as number),
    0,
  );
};

export const CeleryOverviewCards = ({ data }: CeleryOverviewCardsProps) => {
  const activeCount = countTasks(data.active);
  const reservedCount = countTasks(data.reserved);
  const scheduledCount = countTasks(data.scheduled);
  const totalProcessed = countTotalProcessed(data.stats);

  return (
    <StatCardGrid
      className="mb-5"
      spaceless
      stats={[
        { label: translate('Active tasks'), value: activeCount },
        { label: translate('Reserved tasks'), value: reservedCount },
        { label: translate('Scheduled tasks'), value: scheduledCount },
        ...(totalProcessed !== undefined
          ? [{ label: translate('Total processed'), value: totalProcessed }]
          : []),
      ]}
    />
  );
};

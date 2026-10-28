import { CeleryStatsResponse } from 'waldur-js-client';

import { StatisticsCard } from '@/core/StatisticsCard';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 mb-5">
      <div>
        <StatisticsCard title={translate('Active tasks')} value={activeCount} />
      </div>
      <div>
        <StatisticsCard
          title={translate('Reserved tasks')}
          value={reservedCount}
        />
      </div>
      <div>
        <StatisticsCard
          title={translate('Scheduled tasks')}
          value={scheduledCount}
        />
      </div>
      {totalProcessed !== undefined && (
        <div>
          <StatisticsCard
            title={translate('Total processed')}
            value={totalProcessed}
          />
        </div>
      )}
    </div>
  );
};

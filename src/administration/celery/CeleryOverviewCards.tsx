import { Col, Row } from 'react-bootstrap';
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
    <Row className="mb-6">
      <Col md={6} lg={3}>
        <StatisticsCard title={translate('Active tasks')} value={activeCount} />
      </Col>
      <Col md={6} lg={3}>
        <StatisticsCard
          title={translate('Reserved tasks')}
          value={reservedCount}
        />
      </Col>
      <Col md={6} lg={3}>
        <StatisticsCard
          title={translate('Scheduled tasks')}
          value={scheduledCount}
        />
      </Col>
      {totalProcessed !== undefined && (
        <Col md={6} lg={3}>
          <StatisticsCard
            title={translate('Total processed')}
            value={totalProcessed}
          />
        </Col>
      )}
    </Row>
  );
};

import { WarningCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from 'react-bootstrap';
import { celeryStatsRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { CeleryOverviewCards } from './celery/CeleryOverviewCards';
import { CeleryResourceUsage } from './celery/CeleryResourceUsage';
import { CeleryTaskQueues } from './celery/CeleryTaskQueues';
import { CeleryTaskStats } from './celery/CeleryTaskStats';
import { CeleryWorkerInfo } from './celery/CeleryWorkerInfo';

const getCeleryStats = () =>
  celeryStatsRetrieve().then((response) => response.data);

export const CeleryInfoPage = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['CeleryInfoPage'],
    queryFn: getCeleryStats,
  });

  // Early returns for loading and error states
  if (isLoading || !data) {
    return (
      <div className="text-center py-10">
        <LoadingSpinner />
        <p className="text-muted mt-4">
          {translate('Fetching Celery statistics, please standby...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger">{translate('Unable to load data')}</div>
    );
  }

  // Handle case when all values are null (Celery is down)
  const stats = data.stats ?? null;
  const workers = stats ? Object.entries(stats) : [];
  const hasWorkers = workers.length > 0;

  return (
    <div className="celery-info-page">
      {!hasWorkers && (
        <Alert variant="warning" className="mb-6 d-flex align-items-center">
          <WarningCircleIcon size={24} weight="bold" className="me-3" />
          <div>
            <strong>{translate('No Celery workers detected')}</strong>
            <p className="mb-0 mt-1">
              {translate(
                'Celery may be down or not responding. Task queues and statistics are unavailable.',
              )}
            </p>
          </div>
        </Alert>
      )}

      <CeleryOverviewCards data={data} />

      {workers.map(([workerName, workerStats]) => (
        <CeleryWorkerInfo
          key={workerName}
          workerName={workerName}
          stats={workerStats}
        />
      ))}

      <CeleryTaskQueues
        active={data.active}
        reserved={data.reserved}
        scheduled={data.scheduled}
      />

      {workers.map(([workerName, workerStats]) => (
        <div key={`stats-${workerName}`}>
          {workerStats.total && (
            <CeleryTaskStats
              total={workerStats.total as Record<string, number>}
            />
          )}
          {workerStats.rusage && (
            <CeleryResourceUsage
              rusage={workerStats.rusage as Record<string, number>}
            />
          )}
        </div>
      ))}
    </div>
  );
};

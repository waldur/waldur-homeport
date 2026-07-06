import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import {
  marketplacePosixIdPoolsStatsRetrieve,
  PosixIdPool,
  PosixIdPoolNamespaceStats,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { ProgressBar } from '@/core/ProgressBar';
import { translate } from '@/i18n';

const utilizationVariant = (utilization: number, threshold: number) =>
  utilization >= threshold
    ? 'danger'
    : utilization >= threshold * 0.8
      ? 'warning'
      : 'success';

const NamespaceStats: FunctionComponent<{
  label: string;
  stats: PosixIdPoolNamespaceStats | null;
  threshold: number;
}> = ({ label, stats, threshold }) => (
  <div className="mb-3">
    <div className="fw-bold mb-1">{label}</div>
    {stats ? (
      <>
        <ProgressBar
          now={stats.utilization}
          showValue
          compact
          variant={utilizationVariant(stats.utilization, threshold)}
        />
        <div className="text-secondary fs-7 mt-1">
          {translate(
            '{used} of {capacity} ids in use; range [{min}–{max}], next {next}.',
            {
              used: stats.used,
              capacity: stats.capacity,
              min: stats.min,
              max: stats.max,
              next: stats.next,
            },
          )}
        </div>
      </>
    ) : (
      <div className="text-secondary fs-7">
        {translate('Not managed by this pool — sourced externally.')}
      </div>
    )}
  </div>
);

export const PosixIdPoolStatsExpandable: FunctionComponent<{
  row: PosixIdPool;
}> = ({ row }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posix-id-pool-stats', row.uuid],
    queryFn: () =>
      marketplacePosixIdPoolsStatsRetrieve({ path: { uuid: row.uuid! } }).then(
        (response) => response.data,
      ),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error || !data) {
    return <>{translate('Unable to load pool statistics.')}</>;
  }

  return (
    <div className="px-4 py-2" style={{ maxWidth: 480 }}>
      <NamespaceStats
        label={translate('UID')}
        stats={data.uid}
        threshold={data.utilization_threshold}
      />
      <NamespaceStats
        label={translate('GID')}
        stats={data.gid}
        threshold={data.utilization_threshold}
      />
    </div>
  );
};

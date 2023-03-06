import { useMemo } from 'react';
import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { ResourceTabs } from '../ResourceTabs';

import { SnapshotSchedulesSection } from './SnapshotSchedulesSection';
import { SnapshotsSection } from './SnapshotsSection';

interface VolumeCounters {
  snapshots: number;
  snapshot_schedules: number;
}

export const VolumeDetails = ({ scope }) => {
  const { loading, error, value } = useAsync(async () => {
    const counters = (await get<VolumeCounters>(scope.url + 'counters/')).data;
    return { counters };
  });

  const tabs = useMemo(
    () =>
      scope && value
        ? [
            {
              title: translate('Storage'),
              children: [
                {
                  title: translate('Snapshots'),
                  count: value.counters.snapshots,
                  component: SnapshotsSection,
                },
                {
                  title: translate('Snapshot schedules'),
                  count: value.counters.snapshot_schedules,
                  component: SnapshotSchedulesSection,
                },
              ],
            },
          ]
        : [],
    [scope, value],
  );

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load resource details.')}</>;

  return <ResourceTabs tabs={tabs} resource={scope} />;
};

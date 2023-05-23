import { useMemo } from 'react';
import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getResourceDetails } from '@waldur/marketplace/common/api';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';

import { ResourceTabs } from '../ResourceTabs';

import { FloatingIPSection } from './FloatingIPSection';
import { InternalIPSection } from './InternalIPSection';
import { SecurityGroupsSection } from './SecurityGroupsSection';
import { SnapshotSchedulesSection } from './SnapshotSchedulesSection';
import { SnapshotsSection } from './SnapshotsSection';
import { VolumesSection } from './VolumesSection';

interface InstanceCounters {
  volumes: number;
  backups: number;
  backup_schedules: number;
  security_groups: number;
  internal_ips: number;
  floating_ips: number;
}

export const InstanceDetails = ({ resource }) => {
  const { loading, error, value } = useAsync(async () => {
    const instance = (await getResourceDetails(
      resource.uuid,
    )) as OpenStackInstance;
    const counters = (await get<InstanceCounters>(resource.scope + 'counters/'))
      .data;
    return { instance, counters };
  });

  const tabs = useMemo(
    () =>
      resource && value
        ? [
            {
              title: translate('Networking'),
              children: [
                {
                  title: translate('Floating IPs'),
                  count: value.counters.floating_ips,
                  component: FloatingIPSection,
                },
                {
                  title: translate('Internal IPs'),
                  count: value.counters.internal_ips,
                  component: InternalIPSection,
                },
                {
                  title: translate('Security groups'),
                  count: value.counters.security_groups,
                  component: SecurityGroupsSection,
                },
              ],
            },
            {
              title: translate('Storage'),
              children: [
                {
                  title: translate('Snapshot schedules'),
                  count: value.counters.backup_schedules,
                  component: SnapshotSchedulesSection,
                },
                {
                  title: translate('Snapshots'),
                  count: value.counters.backups,
                  component: SnapshotsSection,
                },
                {
                  title: translate('Volumes'),
                  count: value.counters.volumes,
                  component: VolumesSection,
                },
              ],
            },
          ]
        : [],
    [resource, value],
  );

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load resource details.')}</>;

  return <ResourceTabs tabs={tabs} resource={value.instance} />;
};

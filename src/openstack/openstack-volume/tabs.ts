import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { SnapshotSchedulesList } from '../openstack-snapshot-schedule/SnapshotSchedulesList';

import { VolumeSnapshotsList } from './VolumeSnapshotsList';

ResourceTabsConfiguration.register('OpenStackTenant.Volume', () => [
  {
    key: 'snapshots',
    title: translate('Snapshots'),
    component: VolumeSnapshotsList,
  },
  {
    key: 'snapshot_schedules',
    title: translate('Snapshot schedules'),
    component: SnapshotSchedulesList,
  },
  ...getDefaultResourceTabs(),
]);

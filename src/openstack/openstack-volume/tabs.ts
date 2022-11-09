import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { VOLUME_TYPE } from '../constants';

const SnapshotSchedulesList = lazyComponent(
  () => import('../openstack-snapshot-schedule/SnapshotSchedulesList'),
  'SnapshotSchedulesList',
);
const VolumeSnapshotsList = lazyComponent(
  () => import('./VolumeSnapshotsList'),
  'VolumeSnapshotsList',
);

ResourceTabsConfiguration.register(VOLUME_TYPE, () => [
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

NestedResourceTabsConfiguration.register(VOLUME_TYPE, () => [
  {
    title: translate('Snapshots'),
    children: [
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
    ],
  },
]);

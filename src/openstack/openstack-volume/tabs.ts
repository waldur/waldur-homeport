import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';

import { VOLUME_TYPE } from '../constants';

const SnapshotSchedulesList = lazyComponent(
  () => import('../openstack-snapshot-schedule/SnapshotSchedulesList'),
  'SnapshotSchedulesList',
);
const VolumeSnapshotsList = lazyComponent(
  () => import('./VolumeSnapshotsList'),
  'VolumeSnapshotsList',
);

NestedResourceTabsConfiguration.register(VOLUME_TYPE, () => [
  {
    title: translate('Snapshots'),
    key: 'snapshots',
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

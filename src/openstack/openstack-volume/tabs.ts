import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const SnapshotSchedulesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SnapshotSchedulesList" */ '../openstack-snapshot-schedule/SnapshotSchedulesList'
    ),
  'SnapshotSchedulesList',
);
const VolumeSnapshotsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "VolumeSnapshotsList" */ './VolumeSnapshotsList'
    ),
  'VolumeSnapshotsList',
);

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

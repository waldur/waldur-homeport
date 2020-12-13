import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const ScheduleSnapshotsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ScheduleSnapshotsList" */ '../openstack-snapshot/ScheduleSnapshotsList'
    ),
  'ScheduleSnapshotsList',
);

ResourceTabsConfiguration.register('OpenStackTenant.SnapshotSchedule', () => [
  {
    key: 'snapshots',
    title: translate('Snapshots'),
    component: ScheduleSnapshotsList,
  },
  getEventsTab(),
]);

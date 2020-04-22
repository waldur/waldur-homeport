import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { ScheduleSnapshotsList } from '../openstack-snapshot/ScheduleSnapshotsList';

ResourceTabsConfiguration.register('OpenStackTenant.SnapshotSchedule', () => [
  {
    key: 'snapshots',
    title: translate('Snapshots'),
    component: ScheduleSnapshotsList,
  },
  getEventsTab(),
]);

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const BackupsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "BackupsList" */ '../openstack-backup/BackupsList'
    ),
  'BackupsList',
);

ResourceTabsConfiguration.register('OpenStackTenant.BackupSchedule', () => [
  {
    key: 'backups',
    title: translate('VM snapshots'),
    component: BackupsList,
  },
  getEventsTab(),
]);

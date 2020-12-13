import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const BackupSnapshotsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "BackupSnapshotsList" */ './BackupSnapshotsList'
    ),
  'BackupSnapshotsList',
);

ResourceTabsConfiguration.register('OpenStackTenant.Backup', () => [
  {
    key: 'snapshots',
    title: translate('Volume snapshots'),
    component: BackupSnapshotsList,
  },
  getEventsTab(),
]);

import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { BackupSnapshotsList } from './BackupSnapshotsList';

ResourceTabsConfiguration.register('OpenStackTenant.Backup', () => [
  {
    key: 'snapshots',
    title: translate('Snapshots'),
    component: BackupSnapshotsList,
  },
  getEventsTab(),
]);

import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';

import { BackupSnapshotsList } from './BackupSnapshotsList';

// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Backup', () => [
    {
      key: 'snapshots',
      title: translate('Snapshots'),
      component: BackupSnapshotsList,
    },
    getEventsTab(),
  ]);
}

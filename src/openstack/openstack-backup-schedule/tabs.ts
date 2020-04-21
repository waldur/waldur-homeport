import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { BackupsList } from '../openstack-backup/BackupsList';

ResourceTabsConfiguration.register('OpenStackTenant.BackupSchedule', () => [
  {
    key: 'backups',
    title: translate('Backups'),
    component: BackupsList,
  },
  getEventsTab(),
]);

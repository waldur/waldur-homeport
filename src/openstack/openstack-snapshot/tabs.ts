import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { SnapshotRestoredVolumesList } from './SnapshotRestoredVolumesList';

ResourceTabsConfiguration.register('OpenStackTenant.Snapshot', () => [
  {
    key: 'restored',
    title: translate('Restored volumes'),
    component: SnapshotRestoredVolumesList,
  },
  getEventsTab(),
]);

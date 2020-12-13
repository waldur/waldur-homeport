import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const SnapshotRestoredVolumesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SnapshotRestoredVolumesList" */ './SnapshotRestoredVolumesList'
    ),
  'SnapshotRestoredVolumesList',
);

ResourceTabsConfiguration.register('OpenStackTenant.Snapshot', () => [
  {
    key: 'restored',
    title: translate('Restored volumes'),
    component: SnapshotRestoredVolumesList,
  },
  getEventsTab(),
]);

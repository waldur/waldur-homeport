import { translate } from '@waldur/i18n';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';

import { SnapshotSchedulesList } from '../openstack-snapshot-schedule/SnapshotSchedulesList';

import actions from './actions';
import { OpenStackVolumeSummary } from './OpenStackVolumeSummary';
import snapshotCreateDialog from './snapshot-create';
import volumeExtendDialog from './volume-extend';
import './marketplace';
import { VolumeSnapshotsList } from './VolumeSnapshotsList';

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.Volume', actions);
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Volume', {
    error_states: ['error'],
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Volume', () => [
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
}

export default module => {
  ResourceSummary.register('OpenStackTenant.Volume', OpenStackVolumeSummary);
  module.directive('volumeExtendDialog', volumeExtendDialog);
  module.directive('snapshotCreateDialog', snapshotCreateDialog);
  module.config(actionsConfig);
  module.config(stateConfig);
  module.config(tabsConfig);
};

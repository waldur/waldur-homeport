import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import openstackInstanceVolumes from './InstanceVolumesList';
import openstackVolumeSnapshots from './openstack-volume-snapshots';
import openstackVolumesService from './openstack-volumes-service';
import { OpenStackVolumeSummary } from './OpenStackVolumeSummary';
import snapshotCreateDialog from './snapshot-create';
import volumeExtendDialog from './volume-extend';
import './marketplace';

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
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Volume', {
    order: ['snapshots', 'snapshot_schedules', ...DEFAULT_RESOURCE_TABS.order],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      snapshots: {
        heading: gettext('Snapshots'),
        component: 'openstackVolumeSnapshots',
      },
      snapshot_schedules: {
        heading: gettext('Snapshot schedules'),
        component: 'openstackSnapshotSchedulesList',
      },
    }),
  });
}

export default module => {
  ResourceSummary.register('OpenStackTenant.Volume', OpenStackVolumeSummary);
  module.service('openstackVolumesService', openstackVolumesService);
  module.directive('volumeExtendDialog', volumeExtendDialog);
  module.directive('snapshotCreateDialog', snapshotCreateDialog);
  module.component('openstackInstanceVolumes', openstackInstanceVolumes);
  module.component('openstackVolumeSnapshots', openstackVolumeSnapshots);

  module.config(actionsConfig);
  module.config(stateConfig);
  module.config(tabsConfig);
};

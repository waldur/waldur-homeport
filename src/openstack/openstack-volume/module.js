import OpenStackVolumeConfig from './openstack-volume-config';
import volumeExtendDialog from './volume-extend';
import snapshotCreateDialog from './snapshot-create';
import openstackVolumeCheckoutSummary from './openstack-volume-checkout-summary';
import openstackVolumesService from './openstack-volumes-service';
import openstackInstanceVolumes from './openstack-instance-volumes';
import openstackVolumeSnapshots from './openstack-volume-snapshots';
import { OpenStackVolumeSummary } from './OpenStackVolumeSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import './marketplace';
import actions from './actions';

export default module => {
  ResourceSummary.register('OpenStackTenant.Volume', OpenStackVolumeSummary);
  module.service('openstackVolumesService', openstackVolumesService);
  module.directive('volumeExtendDialog', volumeExtendDialog);
  module.directive('snapshotCreateDialog', snapshotCreateDialog);
  module.component('openstackVolumeCheckoutSummary', openstackVolumeCheckoutSummary);
  module.component('openstackInstanceVolumes', openstackInstanceVolumes);
  module.component('openstackVolumeSnapshots', openstackVolumeSnapshots);

  module.config(fieldsConfig);
  module.config(actionsConfig);
  module.config(stateConfig);
  module.config(tabsConfig);
  module.run(registerImportEndpoint);
};

// @ngInject
function registerImportEndpoint(ImportResourcesEndpointRegistry, ENV) {
  ImportResourcesEndpointRegistry.registerEndpoint(
    ENV.resourcesTypes.volumes, 'OpenStackTenant', 'openstacktenant-volumes');
}

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Volume', OpenStackVolumeConfig);
}

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.Volume', actions);
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Volume', {
    error_states: [
      'error'
    ]
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Volume', {
    order: [
      'snapshots',
      'snapshot_schedules',
      ...DEFAULT_RESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      snapshots: {
        heading: gettext('Snapshots'),
        component: 'openstackVolumeSnapshots'
      },
      snapshot_schedules: {
        heading: gettext('Snapshot schedules'),
        component: 'openstackSnapshotSchedulesList'
      },
    })
  });
}

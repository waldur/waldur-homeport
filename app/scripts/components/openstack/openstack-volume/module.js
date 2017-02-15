import OpenStackVolumeConfig from './openstack-volume-config';
import volumeExtendDialog from './volume-extend';
import snapshotCreateDialog from './snapshot-create';
import { openstackVolumeSummary } from './openstack-volume-summary';
import openstackVolumeCheckoutSummary from './openstack-volume-checkout-summary';
import openstackVolumesService from './openstack-volumes-service';
import openstackInstanceVolumes from './openstack-instance-volumes';
import openstackVolumeSnapshots from './openstack-volume-snapshots';
import openstackVolumesList from './openstack-volumes-list';

export default module => {
  module.service('openstackVolumesService', openstackVolumesService);
  module.directive('volumeExtendDialog', volumeExtendDialog);
  module.directive('snapshotCreateDialog', snapshotCreateDialog);
  module.component('openstackVolumeSummary', openstackVolumeSummary);
  module.directive('openstackVolumeCheckoutSummary', openstackVolumeCheckoutSummary);
  module.component('openstackInstanceVolumes', openstackInstanceVolumes);
  module.component('openstackVolumeSnapshots', openstackVolumeSnapshots);
  module.component('openstackVolumesList', openstackVolumesList);

  module.config(fieldsConfig);
  module.config(actionConfig);
  module.config(stateConfig);
  module.config(tabsConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Volume', OpenStackVolumeConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.Volume', {
    order: [
      'edit',
      'pull',
      'attach',
      'detach',
      'extend',
      'snapshot',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Volume has been updated'
      }),
      pull: {
        title: 'Synchronise'
      },
      extend: {
        component: 'volumeExtendDialog'
      },
      snapshot: {
        tab: 'snapshots',
        title: 'Create',
        component: 'snapshotCreateDialog'
      }
    }
  });
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
      ...DEFAULT_RESOURCE_TABS.order,
      'snapshots',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      snapshots: {
        heading: 'Snapshots',
        component: 'openstackVolumeSnapshots'
      },
    })
  });
}

import OpenStackVolumeConfig from './openstack-volume-config';
import volumeExtendDialog from './volume-extend';
import snapshotCreateDialog from './snapshot-create';
import openstackVolumeSummary from './openstack-volume-summary';
import openstackTenantVolumesService from './openstacktenant-volumes-service';
import openstacktenantVolumesList from './openstacktenant-volumes-list';

export default module => {
  module.service('openstackTenantVolumesService', openstackTenantVolumesService);
  module.directive('openstacktenantVolumesList', openstacktenantVolumesList);
  module.directive('volumeExtendDialog', volumeExtendDialog);
  module.directive('snapshotCreateDialog', snapshotCreateDialog);
  module.directive('openstackVolumeSummary', openstackVolumeSummary);

  module.config(fieldsConfig);
  module.config(actionConfig);
  module.config(stateConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Volume', OpenStackVolumeConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.Volume', {
    order: [
      'pull',
      'attach',
      'detach',
      'extend',
      'snapshot',
      'destroy'
    ],
    options: {
      pull: {
        title: 'Synchronise'
      },
      extend: {
        component: 'volumeExtendDialog'
      },
      snapshot: {
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

  ResourceStateConfigurationProvider.register('OpenStackTenant.Snapshot', {
    error_states: [
      'error'
    ]
  });
}

import OpenStackVolumeConfig from './openstack-volume-config';
import volumeExtendDialog from './volume-extend';
import snapshotCreateDialog from './snapshot-create';
import openstackVolumeSummary from './openstack-volume-summary';
import openstackVolumesService from './openstack-volumes-service';
import openstackVolumesList from './openstack-volumes-list';

export default module => {
  module.service('openstackVolumesService', openstackVolumesService);
  module.directive('openstackVolumesList', openstackVolumesList);
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
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_FIELD) {
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
      edit: angular.merge({}, DEFAULT_EDIT_FIELD, {
        successMessage: 'Volume has been updated'
      }),
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

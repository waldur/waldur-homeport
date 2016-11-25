import OpenStackVolumeConfig from './openstack-volume-config';
import volumeExtendDialog from './volume-extend';
import snapshotCreateDialog from './snapshot-create';
import openstackVolumeSummary from './openstack-volume-summary';

export default module => {
  module.directive('volumeExtendDialog', volumeExtendDialog);
  module.directive('snapshotCreateDialog', snapshotCreateDialog);
  module.directive('openstackVolumeSummary', openstackVolumeSummary);

  module.config(fieldsConfig);
  module.config(actionConfig);
}

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

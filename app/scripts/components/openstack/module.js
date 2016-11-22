import OpenStackTenantConfig from './openstack-tenant-config';
import OpenStackInstanceConfig from './openstack-instance-config';
import OpenStackVolumeConfig from './openstack-volume-config';
import volumeExtendDialog from './volume-extend';
import snapshotCreateDialog from './snapshot-create';

export default module => {
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.directive('volumeExtendDialog', volumeExtendDialog);
  module.directive('snapshotCreateDialog', snapshotCreateDialog);
}

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.registerMap({
    'OpenStack.Tenant': OpenStackTenantConfig,
    'OpenStackTenant.Instance': OpenStackInstanceConfig,
    'OpenStackTenant.Volume': OpenStackVolumeConfig
  });
}

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStack.Tenant', {
    order: [
      'pull',
      'create_service',
      'destroy'
    ],
    options: {
      create_service: {
        title: 'Create provider',
      },
      pull: {
        title: 'Synchronise'
      }
    }
  });

  ActionConfigurationProvider.register('OpenStackTenant.Instance', {
    order: [
      'pull',
      'start',
      'stop',
      'restart',
      'change_flavor',
      'assign_floating_ip',
      'update_security_groups',
      'unlink',
      'destroy'
    ],
    options: {
      pull: {
        title: 'Synchronise'
      },
      change_flavor: {
        title: 'Change flavor',
      },
      update_security_groups: {
        title: 'Update security groups'
      },
      destroy: {
        fields: {
          delete_volumes: {
            default_value: true
          }
        }
      }
    }
  });

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

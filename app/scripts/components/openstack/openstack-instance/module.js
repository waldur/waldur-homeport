import openstackInstanceSummary from './openstack-instance-summary';
import OpenStackInstanceConfig from './openstack-instance-config';

export default module => {
  module.directive('openstackInstanceSummary', openstackInstanceSummary);
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.config(stateConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Instance', OpenStackInstanceConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider) {
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
        fields: {
          flavor: {
            formatter: OpenStackInstanceConfig.options.flavor.formatter
          }
        }
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
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Instance', {
    error_states: [
      'ERROR'
    ],
    shutdown_states: [
      'SHUTOFF',
      'STOPPED',
      'SUSPENDED'
    ]
  });
}

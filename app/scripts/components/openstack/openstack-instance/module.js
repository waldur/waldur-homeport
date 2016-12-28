import openstackInstanceSummary from './openstack-instance-summary';
import openstackInstanceSecurityGroups from './openstack-instance-security-groups';
import OpenStackInstanceConfig from './openstack-instance-config';

export default module => {
  module.directive('openstackInstanceSummary', openstackInstanceSummary);
  module.directive('openstackInstanceSecurityGroups', openstackInstanceSecurityGroups);
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.config(stateConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Instance', OpenStackInstanceConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_FIELD) {
  ActionConfigurationProvider.register('OpenStackTenant.Instance', {
    order: [
      'edit',
      'pull',
      'start',
      'stop',
      'restart',
      'change_flavor',
      'assign_floating_ip',
      'update_security_groups',
      'backup',
      'unlink',
      'destroy'
    ],
    options: {
      edit: DEFAULT_EDIT_FIELD,
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
      assign_floating_ip: {
        fields: {
          floating_ip: {
            emptyLabel: 'Allocate and assign new floating IP'
          }
        }
      },
      update_security_groups: {
        title: 'Update security groups',
        fields: {
          security_groups: {
            resource_default_value: true,
            serializer: items => items.map(item => ({url: item.value}))
          }
        }
      },
      destroy: {
        fields: {
          delete_volumes: {
            default_value: true
          }
        }
      },
      backup: {
        fields: {
          description: {
            type: 'text'
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

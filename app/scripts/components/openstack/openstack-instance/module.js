import { openstackInstanceSummary } from './openstack-instance-summary';
import openstackInstanceCheckoutSummary from './openstack-instance-checkout-summary';
import OpenStackInstanceConfig from './openstack-instance-config';
import openstackInstanceFloatingIp from './openstack-instance-floating-ip';
import openstackInstanceSecurityGroupsField from './openstack-instance-security-groups-field';

export default module => {
  module.component('openstackInstanceSummary', openstackInstanceSummary);
  module.directive('openstackInstanceCheckoutSummary', openstackInstanceCheckoutSummary);
  module.component('openstackInstanceFloatingIp', openstackInstanceFloatingIp);
  module.component('openstackInstanceSecurityGroupsField', openstackInstanceSecurityGroupsField);
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.config(stateConfig);
  module.config(tabsConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Instance', OpenStackInstanceConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.Instance', {
    order: [
      'edit',
      'pull',
      'start',
      'stop',
      'restart',
      'change_flavor',
      'assign_floating_ip',
      'unassign_floating_ip',
      'update_security_groups',
      'backup',
      'create_backup_schedule',
      'unlink',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Instance has been updated'
      }),
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
            type: 'multiselect',
            resource_default_value: true,
            serializer: items => items.map(item => ({url: item.value}))
          }
        }
      },
      create_backup_schedule: {
        title: 'Create backup schedule'
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

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Instance', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'volumes',
      'backups',
      'backup_schedules',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      volumes: {
        heading: 'Volumes',
        component: 'openstackInstanceVolumes'
      },
      backups: {
        heading: 'Backups',
        component: 'openstackBackupsList'
      },
      backup_schedules: {
        heading: 'Backup schedules',
        component: 'openstackBackupSchedulesList'
      }
    })
  });
}

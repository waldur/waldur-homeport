import { openstackInstanceSummary } from './openstack-instance-summary';
import openstackInstanceCheckoutSummary from './openstack-instance-checkout-summary';
import OpenStackInstanceConfig from './openstack-instance-config';
import openstackInstanceFloatingIp from './openstack-instance-floating-ip';
import openstackInstanceSecurityGroupsField from './openstack-instance-security-groups-field';
import openstackInstanceInternalIpsList from './openstack-instance-internal-ips-list';

export default module => {
  module.component('openstackInstanceSummary', openstackInstanceSummary);
  module.directive('openstackInstanceCheckoutSummary', openstackInstanceCheckoutSummary);
  module.component('openstackInstanceFloatingIp', openstackInstanceFloatingIp);
  module.component('openstackInstanceSecurityGroupsField', openstackInstanceSecurityGroupsField);
  module.component('openstackInstanceInternalIpsList', openstackInstanceInternalIpsList);
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
      'update_internal_ips_set',
      'unlink',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: gettext('Instance has been updated')
      }),
      pull: {
        title: gettext('Synchronise')
      },
      change_flavor: {
        title: gettext('Change flavor'),
        fields: {
          flavor: {
            formatter: OpenStackInstanceConfig.options.flavor.formatter
          }
        }
      },
      assign_floating_ip: {
        fields: {
          floating_ip: {
            emptyLabel: gettext('Allocate and assign new floating IP')
          }
        }
      },
      update_security_groups: {
        title: gettext('Update security groups'),
        fields: {
          security_groups: {
            type: 'multiselect',
            resource_default_value: true,
            serializer: items => items.map(item => ({url: item.value}))
          }
        }
      },
      create_backup_schedule: {
        title: gettext('Create'),
        dialogTitle: gettext('Create backup schedule for OpenStack instance'),
        tab: 'backup_schedules',
        iconClass: 'fa-plus',
        fields: {
          schedule: {
            type: 'crontab'
          }
        }
      },
      update_internal_ips_set: {
        tab: 'internal_ips',
        title: gettext('Update'),
        fields: {
          internal_ips_set: {
            type: 'multiselect',
            resource_default_value: true,
            serializer: items =>  items.map(item => ({ subnet: item.value })),
            formatter: ($filter, value) => {
              let name = value.name || value.subnet_name;
              let cidr = value.cidr || value.subnet_cidr;
              return `${name} (${cidr})`;
            },
            init: (model) => {
              return model.map(item => {
                item.url = item.subnet;
                return item;
              });
            },
            value_field: 'url',
          }
        },
      },
      destroy: {
        fields: {
          delete_volumes: {
            default_value: true
          }
        }
      },
      backup: {
        tab: 'backups',
        title: gettext('Create'),
        dialogTitle: gettext('Create backup for '),
        iconClass: 'fa-plus',
        fields: {
          description: {
            type: 'text'
          },
          backup_schedule: {
            formatter: ($filter, resource) => resource.name
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
      'internal_ips_set',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      volumes: {
        heading: gettext('Volumes'),
        component: 'openstackInstanceVolumes'
      },
      backups: {
        heading: gettext('Backups'),
        component: 'openstackBackupsList'
      },
      backup_schedules: {
        heading: gettext('Backup schedules'),
        component: 'openstackBackupSchedulesList'
      },
      internal_ips_set: {
        heading: gettext('Internal IPs'),
        component: 'openstackInstanceInternalIpsList'
      }
    })
  });
}

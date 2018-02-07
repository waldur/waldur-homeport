import { $filter } from '@waldur/core/services';
import { flavorFormatter, internalIpFormatter } from './openstack-instance-config';

// @ngInject
export default function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.Instance', {
    order: [
      'edit',
      'pull',
      'start',
      'stop',
      'restart',
      'change_flavor',
      'backup',
      'create_backup_schedule',
      'update_security_groups',
      'update_internal_ips_set',
      'update_floating_ips',
      'unlink',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: gettext('Instance has been updated.')
      }),
      pull: {
        title: gettext('Synchronise')
      },
      change_flavor: {
        title: gettext('Change flavor'),
        order: ['currentFlavor', 'flavor'],
        fields: {
          currentFlavor: {
            component: 'openstackInstanceCurrentFlavor',
          },
          flavor: {
            label: gettext('New flavor'),
            init: function(field, resource) {
              field.choices = field.rawChoices
                .filter(choice => choice.name !== resource.flavor_name)
                .map(flavor => ({
                  display_name: flavorFormatter($filter, flavor),
                  value: flavor.url,
                }));
            },
          }
        }
      },
      update_security_groups: {
        title: gettext('Update security groups'),
        fields: {
          security_groups: {
            type: 'multiselect',
            placeholder: gettext('Select security groups...'),
            resource_default_value: true,
            serializer: items => items.map(item => ({url: item.value}))
          }
        }
      },
      create_backup_schedule: {
        title: gettext('Create'),
        dialogTitle: gettext('Create backup schedule for OpenStack instance'),
        tab: 'backup_schedules',
        iconClass: 'fa fa-plus',
        fields: {
          schedule: {
            type: 'crontab'
          },
          timezone: {
            default_value: 'UTC'
          }
        }
      },
      update_internal_ips_set: {
        tab: 'internal_ips',
        title: gettext('Configure'),
        iconClass: 'fa fa-wrench',
        fields: {
          internal_ips_set: {
            type: 'multiselect',
            label: gettext('Connected subnets'),
            placeholder: gettext('Select subnets to connect to...'),
            resource_default_value: true,
            serializer: items => items.map(item => ({ subnet: item.value })),
            formatter: ($filter, item) => internalIpFormatter(item),
            modelParser: (field, items) => items.map(item => ({
              url: item.subnet,
              name: item.subnet_name,
              cidr: item.subnet_cidr,
            })),
            value_field: 'url',
          }
        },
      },
      update_floating_ips: {
        title: gettext('Update floating IPs'),
        fields: {
          floating_ips: {
            resource_default_value: true,
            component: 'openstackInstanceFloatingIps',
            init: (field, resource) => {
              field.internal_ips_set = resource.internal_ips_set;
            },
            display_name_field: 'address',
            value_field: 'url',
          }
        }
      },
      destroy: {
        fields: {
          delete_volumes: {
            default_value: true
          }
        },
        onSuccess: function($injector) {
          const openstackFloatingIpsService = $injector.get('openstackFloatingIpsService');
          openstackFloatingIpsService.clearAllCacheForCurrentEndpoint();
        },
      },
      backup: {
        tab: 'backups',
        title: gettext('Create'),
        dialogTitle: gettext('Create backup for '),
        iconClass: 'fa fa-plus',
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

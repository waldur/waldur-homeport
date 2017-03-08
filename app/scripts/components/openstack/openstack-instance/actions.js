import {
  flavorFormatter,
  internalIpFormatter
} from './openstack-instance-config';

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
            formatter: flavorFormatter
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

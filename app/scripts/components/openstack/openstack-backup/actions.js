// @ngInject
export default function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.Backup', {
    order: [
      'edit',
      'restore',
      'destroy',
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: gettext('Backup has been updated'),
        fields: {
          kept_until: {
            help_text: gettext('Guaranteed time of backup retention. If null - keep forever.'),
            label: gettext('Kept until'),
            required: false,
            type: 'datetime'
          }
        }
      }),
      restore: {
        fields: {
          flavor: {
            valueFormatter: angular.identity,
            serializer: value => value.url,
            formatter: ($filter, resource) => $filter('formatFlavor')(resource)
          },
          summary: {
            component: 'openstackBackupRestoreSummary',
            formGroupClass: 'm-b-n'
          },
          security_groups: {
            type: 'multiselect',
            placeholder: gettext('Select security groups...'),
            resource_default_value: true,
            serializer: items => items.map(item => ({url: item.value}))
          },
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
          },
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
      }
    }
  });
}

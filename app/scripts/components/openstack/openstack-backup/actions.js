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
            init: function(field, resource, form) {
              form.security_groups = resource.instance_security_groups;
            },
            serializer: items => items.map(item => ({url: item.value}))
          },
          networks: {
            label: gettext('Networks'),
            component: 'openstackInstanceNetworks',
            init: function(field, resource, form, action) {
              field.choices = {
                subnets: action.fields.internal_ips_set.rawChoices,
                floating_ips: action.fields.floating_ips.rawChoices,
              };
              form.internal_ips_set = resource.instance_internal_ips_set;
            }
          }
        },
        order: [
          'flavor',
          'security_groups',
          'networks',
          'summary',
        ],
        followRedirect: true
      }
    }
  });
}

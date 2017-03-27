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
          }
        }
      }
    }
  });
}

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
        successMessage: 'Backup has been updated',
        fields: {
          kept_until: {
            help_text: 'Guaranteed time of backup retention. If null - keep forever.',
            label: 'Kept until',
            required: false,
            type: 'datetime'
          }
        }
      })
    }
  });
}

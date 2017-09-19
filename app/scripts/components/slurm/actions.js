// @ngInject
export default function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('SLURM.Allocation', {
    order: [
      'edit',
      'cancel',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: gettext('Allocation has been updated.'),
        fields: {
          cpu_limit: {
            type: 'integer',
            label: gettext('CPU limit, minutes'),
            required: true,
            resource_default_value: true,
          },
          gpu_limit: {
            type: 'integer',
            label: gettext('GPU limit, minutes'),
            required: true,
            resource_default_value: true,
          },
          ram_limit: {
            type: 'integer',
            label: gettext('RAM limit, MB'),
            required: true,
            resource_default_value: true,
          }
        }
      }),
    }
  });
}

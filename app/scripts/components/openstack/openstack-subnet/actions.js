// @ngInject
export default function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStack.SubNet', {
    order: [
      'edit',
      'pull',
      'destroy'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Subnet has been updated'
      }),
      pull: {
        title: 'Synchronise'
      },
    }
  });
}

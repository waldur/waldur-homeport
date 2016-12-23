import template from './appstore-field-password.html';

export default function appstoreFieldPassword() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      field: '=',
      model: '='
    },
    controller: function() {},
    controllerAs: '$ctrl',
    bindToController: true
  };
}

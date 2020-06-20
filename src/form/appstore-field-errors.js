import template from './appstore-field-errors.html';

export default function appstoreFieldErrors() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      errors: '=',
      field: '=',
    },
    controller: function () {
      // suppress linter error
    },
    controllerAs: '$ctrl',
    bindToController: true,
  };
}

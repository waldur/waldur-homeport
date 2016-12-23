import template from './appstore-field-integer.html';

export default function appstoreFieldInteger() {
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

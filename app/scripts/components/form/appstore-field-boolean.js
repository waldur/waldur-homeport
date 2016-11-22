import template from './appstore-field-boolean.html';

export default function appstoreFieldBoolean() {
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
  }
}

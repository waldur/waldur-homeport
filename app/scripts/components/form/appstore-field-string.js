import template from './appstore-field-string.html';

export default function appstoreFieldString() {
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

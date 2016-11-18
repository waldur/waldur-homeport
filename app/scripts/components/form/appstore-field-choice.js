import template from './appstore-field-choice.html';

export default function appstoreFieldChoice() {
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

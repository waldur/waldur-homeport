import template from './appstore-field-text.html';

export default function appstoreFieldText() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      field: '=',
      model: '=',
    },
    controller: function() {},
    controllerAs: '$ctrl',
    bindToController: true,
  };
}

import template from './appstore-form.html';

export default function appstoreForm() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      fields: '=',
      model: '=',
      errors: '='
    },
    controller: function() {
      this.renderLabel = function(field) {
        return field.type != 'boolean' && field.type != 'label';
      }
    },
    controllerAs: '$ctrl',
    bindToController: true
  }
}

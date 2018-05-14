import template from './appstore-field-select.html';

const appstoreFieldSelect = {
  template,
  bindings: {
    field: '<',
    model: '<'
  },
  controller: class FieldController {
    $onInit() {
      if (this.field.parser) {
        const choices = this.field.choices.map(this.field.parser);
        this.field = angular.extend({}, this.field, {choices});
      }
    }
  }
};

export default appstoreFieldSelect;

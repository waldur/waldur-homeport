import template from './appstore-field-multiselect.html';

const appstoreFieldMultiselect = {
  template,
  bindings: {
    model: '<',
    field: '<'
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

export default appstoreFieldMultiselect;

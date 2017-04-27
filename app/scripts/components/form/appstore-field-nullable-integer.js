import template from './appstore-field-nullable-integer.html';

const appstoreFieldNullableInteger = {
  template: template,
  controller: class FieldController {
    $postLink() {
      // disable nullable field by default
      this.toggleField();
    }

    toggleField() {
      this.model[this.field.name] = this.model[this.field.name] === undefined ? this.field.min : undefined;
      this.active = this.model[this.field.name] !== undefined;
    }
  },
  bindings: {
    field: '<',
    model: '<',
    form: '<',
  },
};

export default appstoreFieldNullableInteger;

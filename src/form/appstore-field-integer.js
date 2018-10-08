import template from './appstore-field-integer.html';

const appstoreFieldInteger = {
  template,
  bindings: {
    field: '<',
    model: '<',
    form: '<',
  },
  controller: function() {
    if (this.field.type === 'integer' && !this.field.factor) {
      this.field.factor = 1;
    }
  }
};

export default appstoreFieldInteger;

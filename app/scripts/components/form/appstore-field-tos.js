import template from './appstore-field-tos.html';

const appstoreFieldTos = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class appstoreFieldTosController {
    invalid() {
      return this.form[this.field.name].$dirty && this.form[this.field.name].$invalid;
    }

    showRequiredError() {
      return this.invalid() && this.form[this.field.name].$error.required;
    }
  },
};

export default appstoreFieldTos;

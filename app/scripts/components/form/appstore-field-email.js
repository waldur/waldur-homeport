import template from './appstore-field-email.html';

const appstoreFieldEmail = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class AppstoreFieldEmailController {
    constructor(coreUtils) {
      this.coreUtils = coreUtils;
    }

    invalid() {
      return this.form && this.form[this.field.name].$dirty && this.form[this.field.name].$invalid;
    }

    showRequiredError() {
      return this.invalid() && this.form[this.field.name].$error.required;
    }

    showMaxLengthError() {
      return this.invalid() && this.form[this.field.name].$error.maxlength;
    }

    showEmailError() {
      return this.invalid() && this.form[this.field.name].$error.email;
    }

    getMaxLengthErrorMessage() {
      return this.coreUtils.templateFormatter(gettext('Field length must be less than {maxlength} symbols'), {
        maxlength: this.field.maxlength,
      });
    }
  },
};

export default appstoreFieldEmail;

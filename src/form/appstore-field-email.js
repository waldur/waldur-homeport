import template from './appstore-field-email.html';

const appstoreFieldEmail = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class AppstoreFieldEmailController {
    // @ngInject
    constructor(coreUtils, formUtils) {
      this.coreUtils = coreUtils;
      this.formUtils = formUtils;
    }

    invalid() {
      return this.formUtils.formFieldInvalid(this.form, this.field.name);
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

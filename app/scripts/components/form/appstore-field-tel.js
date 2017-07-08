import template from './appstore-field-tel.html';

const appstoreFieldTel = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class AppstoreFieldTelController {
    constructor(coreUtils) {
      this.coreUtils = coreUtils;
    }

    invalid() {
      return this.form[this.field.name].$dirty && this.form[this.field.name].$invalid;
    }

    showRequiredError() {
      return this.invalid() && this.form[this.field.name].$error.required;
    }

    showMaxLengthError() {
      return this.invalid() && this.form[this.field.name].$error.maxlength;
    }

    getMaxLengthErrorMessage() {
      return this.coreUtils.templateFormatter(gettext('Field length must be less than {maxlength} symbols'), {
        maxlength: this.field.maxlength,
      });
    }
  },
};

export default appstoreFieldTel;

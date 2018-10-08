import template from './appstore-field-tel.html';

const appstoreFieldTel = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class AppstoreFieldTelController {
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

    getMaxLengthErrorMessage() {
      return this.coreUtils.templateFormatter(gettext('Field length must be less than {maxlength} symbols'), {
        maxlength: this.field.maxlength,
      });
    }
  },
};

export default appstoreFieldTel;

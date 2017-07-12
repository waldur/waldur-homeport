import template from './appstore-field-string.html';

const appstoreFieldString = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class AppstoreFieldStringController {
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

    getMaxLengthErrorMessage() {
      return this.coreUtils.templateFormatter(gettext('Field length must be less than {maxlength} symbols'), {
        maxlength: this.field.maxlength,
      });
    }
  },
};

export default appstoreFieldString;

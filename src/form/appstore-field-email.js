import { translate } from '@waldur/i18n';

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
    constructor(formUtils) {
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
      return translate('Field length must be less than {maxlength} symbols', {
        maxlength: this.field.maxlength,
      });
    }
  },
};

export default appstoreFieldEmail;

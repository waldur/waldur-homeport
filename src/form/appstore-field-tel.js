import { translate } from '@waldur/i18n';

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

    getMaxLengthErrorMessage() {
      return translate('Field length must be less than {maxlength} symbols', {
        maxlength: this.field.maxlength,
      });
    }
  },
};

export default appstoreFieldTel;

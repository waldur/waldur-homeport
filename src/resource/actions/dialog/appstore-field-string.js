import { translate } from '@waldur/i18n';

import template from './appstore-field-string.html';
import { formFieldInvalid } from './utils';

const appstoreFieldString = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class AppstoreFieldStringController {
    invalid() {
      return formFieldInvalid(this.form, this.field.name);
    }

    showRequiredError() {
      return this.invalid() && this.form[this.field.name].$error.required;
    }

    showMaxLengthError() {
      return this.invalid() && this.form[this.field.name].$error.maxlength;
    }

    showPatternError() {
      return this.invalid() && this.form[this.field.name].$error.pattern;
    }

    getMaxLengthErrorMessage() {
      return translate('Field length must be less than {maxlength} symbols', {
        maxlength: this.field.maxlength,
      });
    }
  },
};

export default appstoreFieldString;

import { translate } from '@waldur/i18n';

const template = require('./action-field-integer.html');

export default {
  template,
  bindings: {
    model: '<',
    field: '<',
    form: '<',
  },
  controller: class {
    field;
    $onInit() {
      if (!this.field.factor) {
        this.field.factor = 1;
      }
    }

    get minValue() {
      return Math.round(this.field.min_value / this.field.factor);
    }

    get maxValue() {
      return Math.round(this.field.max_value / this.field.factor);
    }

    getInvalidErrorMessage() {
      return translate('Not a valid value.');
    }

    getMinErrorMessage() {
      return translate('Minimal valid value is {minValue} {units}.', {
        minValue: this.minValue,
        units: this.field.units,
      });
    }

    getMaxErrorMessage() {
      return translate('Maximal valid value is {minValue} {units}.', {
        maxValue: this.maxValue,
        units: this.field.units,
      });
    }
  },
};

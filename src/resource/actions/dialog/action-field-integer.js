import template from './action-field-integer.html';

export default {
  template,
  bindings: {
    model: '<',
    field: '<',
    form: '<',
  },
  controller: class {
    constructor() {
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
  }
};

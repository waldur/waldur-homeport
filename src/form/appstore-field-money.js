import template from './appstore-field-integer.html';

const appstoreFieldMoney = {
  template,
  bindings: {
    field: '<',
    model: '<',
    form: '<',
  },
  controller: class AppstoreFieldMoneyController {
    // @ngInject
    constructor(ENV) {
      this.currency = ENV.currency;
    }

    $onInit() {
      this.field.units = this.currency;
      this.field.min = 0;
      this.field.factor = 1;
    }
  },
};

export default appstoreFieldMoney;

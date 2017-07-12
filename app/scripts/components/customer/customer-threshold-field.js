import template from './customer-threshold-field.html';

const customerThresholdField = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
  },
  controller: class CustomerThresholdFieldController {
    $onInit() {
      if (!this.model[this.field.name]) {
        this.model[this.field.name] = {
          priceEstimate: {
            limit: -1,
            total: 0,
            threshold: 0,
          }
        };
      }
    }
  }
};

export default customerThresholdField;

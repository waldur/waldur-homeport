import template from './billing-type.html';

const billingType = {
  template,
  bindings: {
    model: '<',
  },
  controller: class BillingTypeController {
    // @ngInject
    $onInit() {
      this.class = this.model.recurring_billing ? 'fa-repeat': 'fa-file-text';
      this.tooltip = this.model.recurring_billing ? gettext('Organization is billed on monthly basis.'): gettext('Organization is billed on project completion.');
    }
  }
};

export default billingType;

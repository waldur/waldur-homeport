import template from './paypal-invoice-state.html';

const labelClasses = {
  DRAFT: 'label-warning',
  SENT: 'label-primary',
  CANCELLED: 'label-danger',
  PAID: 'label-success',
};

const paypalInvoiceState = {
  template: template,
  bindings: {
    model: '<',
  },
  controller: class {
    getLabelClass() {
      if (!this.model) {
        return;
      }
      const { state } = this.model;
      return labelClasses[state] || 'label-info';
    }
  }
};

export default paypalInvoiceState;

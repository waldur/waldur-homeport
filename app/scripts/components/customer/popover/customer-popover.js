import template from './customer-popover.html';

const customerPopover = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class CustomerPopoverController {
    constructor($q, customersService, paymentDetailsService) {
      // @ngInject
      this.$q = $q;
      this.customersService = customersService;
      this.paymentDetailsService = paymentDetailsService;
      this.options = {
        scrollY: '400px',
        scrollCollapse: true
      };
    }

    $onInit() {
      this.loading = true;
      this.loadData().finally(() => {
        this.loading = false;
      });
    }

    loadData() {
      return this.$q.all([
        this.loadCustomer(),
        this.loadPaymentDetails(),
      ]);
    }

    loadCustomer() {
      return this.customersService.$get(
        this.resolve.customer_uuid
      ).then(customer => {
        this.customer = customer;
      });
    }

    loadPaymentDetails() {
      return this.paymentDetailsService.getList({
        customer_uuid: this.resolve.customer_uuid
      }).then(result => {
        this.paymentDetails = result[0];
      });
    }
  }
};

export default customerPopover;

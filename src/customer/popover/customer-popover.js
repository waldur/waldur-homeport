import template from './customer-popover.html';

const customerPopover = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class CustomerPopoverController {
    // @ngInject
    constructor($q, customersService) {
      this.$q = $q;
      this.customersService = customersService;
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
      return this.customersService.$get(
        this.resolve.customer_uuid
      ).then(customer => {
        this.customer = customer;
      });
    }
  }
};

export default customerPopover;

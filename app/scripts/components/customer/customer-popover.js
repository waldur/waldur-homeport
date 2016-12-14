import template from './customer-popover.html';

export default function customerPopover() {
  return {
    restrict: 'E',
    template: template,
    controller: CustomerPopoverController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '='
    }
  };
}

// @ngInject
class CustomerPopoverController {
  constructor(customersService) {
    this.customersService = customersService;
    this.init();
  }

  init() {
    this.options = {
      scrollY: '400px',
      scrollCollapse: true
    };
    this.loading = true;
    this.customersService.$get(this.resolve.customer.uuid).then(customer => {
      this.customer = customer;
    }).finally(() => {
      this.loading = false;
    });
  }
}

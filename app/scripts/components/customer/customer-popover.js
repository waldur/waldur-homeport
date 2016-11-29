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

function CustomerPopoverController() {
  this.customer = this.resolve.customer;
}

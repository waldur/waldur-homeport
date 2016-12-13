import template from './customer-issues.html';

export default function customerIssues() {
  return {
    restrict: 'E',
    controller: CustomerIssuesController,
    controllerAs: '$ctrl',
    template: template,
    scope: {},
    bindToController: true
  };
}

class CustomerIssuesController {
  constructor(currentStateService) {
    this.loading = true;
    currentStateService.getCustomer().then(customer => {
      this.customer = customer;
    }).finally(() => {
      this.loading = false;
    });
  }
}

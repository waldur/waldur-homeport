import template from './customer-issues.html';

class CustomerIssuesController {
  constructor(currentStateService, $uibModal, $rootScope) {
    this.currentStateService = currentStateService;
    this.$uibModal = $uibModal;
    this.$rootScope = $rootScope;
  }

  $onInit() {
    this.loading = true;
    this.currentStateService.getCustomer().then(customer => {
      this.setOptions(customer);
    }).finally(() => {
      this.loading = false;
    });
  }

  setOptions(customer) {
    this.filter = {
      customer: customer.url
    };
    this.options = {
      disableAutoUpdate: false,
      disableSearch: false,
      hiddenColumns: [
        'customer',
      ],
      tableActions: [
        {
          title: gettext('Create'),
          iconClass: 'fa fa-plus',
          callback: () => {
            this.$uibModal.open({
              component: 'issueCreateDialog',
              resolve: {
                issue: () => ({customer})
              }
            });
          }
        }
      ]
    };
  }
}

const customerIssues = {
  controller: CustomerIssuesController,
  template: template,
};

export default customerIssues;

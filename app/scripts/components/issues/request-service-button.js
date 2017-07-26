import template from './request-service-button.html';

const requestServiceButton = {
  template: template,
  controller: class RequestServiceButtonController {
    // @ngInject
    constructor($uibModal, $uibModalStack, ISSUE_IDS, currentStateService) {
      this.$uibModal = $uibModal;
      this.$uibModalStack = $uibModalStack;
      this.ISSUE_IDS = ISSUE_IDS;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.loadCustomer();
    }

    loadCustomer() {
      return this.currentStateService.getCustomer().then(customer => this.currentCustomer = customer);
    }

    requestService() {
      this.$uibModalStack.dismissAll();
      return this.$uibModal.open({
        component: 'issueCreateDialog',
        resolve: {
          issue: () => ({
            customer: this.currentCustomer,
            type: this.ISSUE_IDS.SERVICE_REQUEST
          }),
          options: {
            title: gettext('Request a new service'),
            descriptionPlaceholder: gettext('Please clarify why do you need it'),
            descriptionLabel: gettext('Motivation'),
            summaryLabel: gettext('Service name'),
          }
        }
      });
    }
  }
};

export default requestServiceButton;

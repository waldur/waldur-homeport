import template from './billing-record-header.html';

const billingRecordHeader = {
  template,
  bindings: {
    invoice: '<'
  },
  controller: class BillingRecordHeaderController {
    // @ngInject
    constructor($window, currentStateService, BreadcrumbsService) {
      this.$window = $window;
      this.currentStateService = currentStateService;
      this.BreadcrumbsService = BreadcrumbsService;
    }

    $onInit() {
      this.refreshBreadcrumbs();
    }

    refreshBreadcrumbs() {
      const customerUUID = this.currentStateService.getCustomerUuid();
      this.BreadcrumbsService.activeItem = this.invoice.period;
      this.BreadcrumbsService.items = [
        {
          label: gettext('Organization workspace'),
          state: 'organization.details',
          params: {
            uuid: customerUUID
          }
        },
        {
          label: gettext('Accounting records'),
          state: 'organization.billing.tabs',
          params: {
            uuid: customerUUID
          }
        }
      ];
    }

    printLink() {
      this.$window.print();
    }
  }
};

export default billingRecordHeader;

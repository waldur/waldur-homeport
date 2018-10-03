import template from './billing-tabs.html';

const billingTabs = {
  template,
  controller: class BillingTabsController {
    // @ngInject
    constructor(BreadcrumbsService, titleService, BillingUtils, ENV, features, currentStateService) {
      this.BreadcrumbsService = BreadcrumbsService;
      this.titleService = titleService;
      this.utils = BillingUtils;
      this.ENV = ENV;
      this.features = features;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.titleService.setTitle(this.utils.getPageTitle());
      this.BreadcrumbsService.activeItem = this.utils.getTabTitle();
      this.showAccountingRecords = this.ENV.accountingMode === 'accounting';
      this.payPalVisible = this.features.isVisible('paypal');
      this.currentStateService.getCustomer().then(customer => this.customer = customer);
    }
  }
};

export default billingTabs;

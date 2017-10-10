import template from './billing-tabs.html';

const billingTabs = {
  template,
  controller: class BillingTabsController {
    constructor(BreadcrumbsService, titleService, BillingUtils, ENV, features) {
      // @ngInject
      this.BreadcrumbsService = BreadcrumbsService;
      this.titleService = titleService;
      this.utils = BillingUtils;
      this.ENV = ENV;
      this.features = features;
    }

    $onInit() {
      this.titleService.setTitle(this.utils.getPageTitle());
      this.BreadcrumbsService.activeItem = this.utils.getTabTitle();
      this.showAccountingRecords = this.ENV.accountingMode === 'accounting';
      this.payPalVisible = this.features.isVisible('paypal');
    }
  }
};

export default billingTabs;

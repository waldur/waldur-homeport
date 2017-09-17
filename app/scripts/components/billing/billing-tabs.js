import template from './billing-tabs.html';

const billingTabs = {
  template,
  controller: class {
    constructor($rootScope, titleService, BillingUtils, ENV, features) {
      // @ngInject
      this.$rootScope = $rootScope;
      this.titleService = titleService;
      this.utils = BillingUtils;
      this.ENV = ENV;
      this.features = features;
    }

    $onInit() {
      this.titleService.setTitle(this.utils.getPageTitle());
      this.$rootScope.$broadcast('breadcrumbChanged', this.utils.getTabTitle());
      this.showAccountingRecords = this.ENV.accountingMode === 'accounting';
      this.payPalVisible = this.features.isVisible('paypal');
    }
  }
};

export default billingTabs;

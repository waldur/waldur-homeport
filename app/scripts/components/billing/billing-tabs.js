import template from './billing-tabs.html';

const billingTabs = {
  template,
  controller: class {
    constructor($rootScope, titleService, BillingUtils, ENV) {
      // @ngInject
      this.$rootScope = $rootScope;
      this.titleService = titleService;
      this.utils = BillingUtils;
      this.ENV = ENV;
    }

    $onInit() {
      this.titleService.setTitle(this.utils.getPageTitle());
      this.$rootScope.$broadcast('breadcrumbChanged', this.utils.getTabTitle());
      this.showAccountingRecords = this.ENV.accountingMode === 'accounting';
    }
  }
};

export default billingTabs;

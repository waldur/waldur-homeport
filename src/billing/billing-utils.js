const MODES = {
  accounting: gettext('Accounting'),
  billing: gettext('Billing'),
};

export default class BillingUtils {
  // @ngInject
  constructor(ENV, $filter, invoicesService, ncUtilsFlash) {
    this.ENV = ENV;
    this.$filter = $filter;
    this.invoicesService = invoicesService;
    this.ncUtilsFlash = ncUtilsFlash;
  }

  formatPeriod({ year, month }) {
    return `${year}-${month < 10 ? '0' : ''}${month}`;
  }

  getTabTitle() {
    const title = MODES[this.ENV.accountingMode];
    return this.$filter('translate')(title);
  }

  getPageTitle() {
    return `${this.ENV.shortPageTitle} | ${this.getTabTitle()}`;
  }
}

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

  groupInvoiceItems(items) {
    const projects = {
      default: {
        items: [],
        name: '',
      },
    };
    this.groupInvoiceSubItems(items, projects);
    return Object.keys(projects)
      .map(key => projects[key])
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  groupInvoiceSubItems(items, projects) {
    items.forEach(item => {
      if (!item.project_uuid) {
        projects.default.items.push(item);
      } else {
        if (!projects[item.project_uuid]) {
          projects[item.project_uuid] = {
            items: [],
            name: item.project_name,
          };
        }
        projects[item.project_uuid].items.push(item);
      }
    });
  }
}

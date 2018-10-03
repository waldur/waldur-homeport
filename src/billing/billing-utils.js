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

  getUserFilter() {
    return {
      name: 'state',
      choices: [
        {
          title: gettext('Pending'),
          value: 'pending',
        },
        {
          title: gettext('Canceled'),
          value: 'canceled'
        },
        {
          title: gettext('Created'),
          value: 'created'
        }
      ]
    };
  }

  getTableActions() {
    return [
      {
        title: gettext('Send notification'),
        iconClass: 'fa fa-envelope-o',
        callback: this.sendNotification.bind(this),

        isDisabled: row => row.state !== 'created',

        tooltip: function(row) {
          if (row.state !== 'created') {
            return gettext('Notification only for the created invoice can be sent.');
          }
        }
      }
    ];
  }

  sendNotification(invoice) {
    this.invoicesService.sendNotification(invoice.uuid).then(() => {
      this.ncUtilsFlash.success(gettext('Record notification has been sent to organization owners.'));
    }).catch(() => {
      this.ncUtilsFlash.error(gettext('Unable to send record notification.'));
    });
  }

  groupInvoiceItems(items) {
    let projects = {
      default: {
        items: [],
        name: '',
      }
    };
    this.groupInvoiceSubItems(items, projects);
    return Object.keys(projects).map(key => projects[key]);
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

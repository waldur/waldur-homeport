const MODES = {
  accounting: gettext('Accounting'),
  billing: gettext('Billing'),
};

// @ngInject
export default class BillingUtils {
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

  getSearchFilters() {
    return [
      {
        name: 'state',
        title: 'Pending',
        value: 'pending'
      },
      {
        name: 'state',
        title: 'Canceled',
        value: 'canceled'
      },
      {
        name: 'state',
        title: 'Created',
        value: 'created'
      },
    ];
  }

  getTableActions() {
    return [
      {
        name: '<i class="fa fa-envelope-o"></i> Send notification',
        callback: this.sendNotification.bind(this),

        isDisabled: row => row.state != 'created',

        tooltip: function(row) {
          if (row.state != 'created') {
            return 'Notification only for the created invoice can be sent.';
          }
        }
      }
    ];
  }

  sendNotification(invoice) {
    this.invoicesService.sendNotification(invoice.uuid).then(() => {
      this.ncUtilsFlash.success('Record notification has been sent to organization owners.');
    }).catch(() => {
      this.ncUtilsFlash.error('Unable to send record notification.');
    });
  }
}

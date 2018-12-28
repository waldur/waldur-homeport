const paypalInvoicesList = {
  controller: PayPalInvoicesListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html'
};

export default paypalInvoicesList;

// @ngInject
function PayPalInvoicesListController(
  $state,
  baseControllerListClass,
  currentStateService,
  paypalInvoicesService,
  customersService,
  ncUtils,
  $filter) {
  let controllerScope = this;
  let InvoicesController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = paypalInvoicesService;
      this.controllerScope = controllerScope;
      let fn = this._super.bind(this);
      return currentStateService.getCustomer().then(currentCustomer => {
        this.currentCustomer = currentCustomer;
        customersService.isOwnerOrStaff().then((isOwnerOrStaff) => {
          this.isOwnerOrStaff = isOwnerOrStaff;
          this.tableOptions = this.getTableOptions();
          return fn();
        });
      });
    },
    getTableOptions: function() {
      let vm = this;
      return {
        noDataText: gettext('You have no invoices yet.'),
        noMatchesText: gettext('No invoices found matching filter.'),
        disableSearch: true,
        columns: [
          {
            title: gettext('Invoice number'),
            className: 'all',
            render: function(row) {
              const href = $state.href('billingDetails', {uuid: row.uuid});
              return ncUtils.renderLink(href, row.number || 'N/A');
            }
          },
          {
            title: gettext('State'),
            className: 'all',
            render: row => {
              const index = vm.findIndexById(row);
              return `<paypal-invoice-state model="controller.list[${index}]">`;
            }
          },
          {
            title: gettext('Price'),
            className: 'all',
            render: row => $filter('defaultCurrency')(row.price)
          },
          {
            title: gettext('Tax'),
            className: 'min-tablet-l',
            render: row => $filter('defaultCurrency')(row.tax)
          },
          {
            title: gettext('Total'),
            className: 'min-tablet-l',
            render: row => $filter('defaultCurrency')(row.total)
          },
          {
            title: gettext('Invoice date'),
            className: 'all',
            render: row => row.start_date || '&mdash;'
          },
          {
            title: gettext('Due date'),
            className: 'min-tablet-l',
            render: row => row.end_date || '&mdash;'
          }
        ],
        rowActions: this.getRowActions.bind(this),
      };
    },
    getRowActions: function(row) {
      if (this.isOwnerOrStaff) {
        const index = this.findIndexById(row);
        return `<paypal-invoice-actions invoice="controller.list[${index}]"></paypal-invoice-actions>`;
      }
    },
    getUserFilter: function() {
      return {
        name: 'state',
        choices: [
          {
            title: gettext('Draft'),
            value: 'DRAFT',
          },
          {
            title: gettext('Sent'),
            value: 'SENT',
          },
          {
            title: gettext('Paid'),
            value: 'PAID'
          },
          {
            title: gettext('Unpaid'),
            value: 'UNPAID'
          },
          {
            title: gettext('Payment pending'),
            value: 'PAYMENT_PENDING'
          },
          {
            title: gettext('Cancelled'),
            value: 'CANCELLED'
          },
        ]
      };
    },
    getFilter: function() {
      return {
        customer: this.currentCustomer.url,
      };
    }
  });

  controllerScope.__proto__ = new InvoicesController();
}

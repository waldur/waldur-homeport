const invoicesList = {
  controller: InvoicesListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html'
};

export default invoicesList;

// @ngInject
function InvoicesListController(
  baseControllerListClass,
  currentStateService,
  usersService,
  invoicesService,
  BillingUtils,
  ncUtils,
  $state,
  $filter) {
  let controllerScope = this;
  let InvoicesController = baseControllerListClass.extend({
    init: function() {
      this.service = invoicesService;
      let fn = this._super.bind(this);
      return usersService.getCurrentUser().then(currentUser => {
        this.currentUser = currentUser;
        return currentStateService.getCustomer().then(currentCustomer => {
          this.currentCustomer = currentCustomer;
          this.tableOptions = this.getTableOptions();
          return fn();
        });
      });
    },
    getTableOptions: function() {
      return {
        noDataText: gettext('You have no invoices yet.'),
        noMatchesText: gettext('No invoices found matching filter.'),
        searchFieldName: 'number',
        columns: [
          {
            title: gettext('Invoice number'),
            className: 'all',
            render: function(row) {
              const href = $state.href('billingDetails', {uuid: row.uuid});
              return ncUtils.renderLink(href, row.number);
            }
          },
          {
            title: gettext('State'),
            className: 'all',
            render: row => row.state
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
            render: row => row.invoice_date || '&mdash;'
          },
          {
            title: gettext('Due date'),
            className: 'min-tablet-l',
            render: row => row.due_date || '&mdash;'
          }
        ],
        rowActions: this.getRowActions()
      };
    },
    getRowActions: function() {
      if (this.currentUser.is_staff) {
        return BillingUtils.getTableActions();
      }
    },
    getUserFilter: function() {
      const base = BillingUtils.getUserFilter();
      return angular.merge({}, base, {
        choices: base.choices.concat({
          title: gettext('Paid'),
          value: 'paid'
        })
      });
    },
    getFilter: function() {
      return {
        customer: this.currentCustomer.url
      };
    }
  });

  controllerScope.__proto__ = new InvoicesController();
}

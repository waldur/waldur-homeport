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
  ncUtilsFlash,
  $state,
  $filter) {
  var controllerScope = this;
  var InvoicesController = baseControllerListClass.extend({
    init: function() {
      this.service = invoicesService;
      this.getSearchFilters();
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
        noDataText: 'You have no invoices yet',
        noMatchesText: 'No invoices found matching filter.',
        searchFieldName: 'number',
        columns: [
          {
            title: 'Invoice number',
            className: 'all',
            render: function(row) {
              const href = $state.href('billingDetails', {uuid: row.uuid});
              return ncUtils.renderLink(href, row.number);
            }
          },
          {
            title: 'State',
            className: 'all',
            render: row => row.state
          },
          {
            title: 'Price',
            className: 'all',
            render: row => $filter('defaultCurrency')(row.price)
          },
          {
            title: 'Tax',
            className: 'min-tablet-l',
            render: row => $filter('defaultCurrency')(row.tax)
          },
          {
            title: 'Total',
            className: 'min-tablet-l',
            render: row => $filter('defaultCurrency')(row.total)
          },
          {
            title: 'Invoice date',
            className: 'all',
            render: row => row.invoice_date || '&mdash;'
          },
          {
            title: 'Due date',
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
    getSearchFilters: function() {
      this.searchFilters = [
        ...BillingUtils.getSearchFilters(),
        {
          name: 'state',
          title: 'Paid',
          value: 'paid'
        }
      ];
    },
    getFilter: function() {
      return {
        customer: this.currentCustomer.url
      };
    }
  });

  controllerScope.__proto__ = new InvoicesController();
}

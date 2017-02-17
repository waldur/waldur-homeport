const billingRecordsList = {
  controller: RecordsListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html'
};

export default billingRecordsList;

// @ngInject
function RecordsListController(
  baseControllerListClass,
  currentStateService,
  usersService,
  invoicesService,
  ncUtils,
  ncUtilsFlash,
  BillingUtils,
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
        noDataText: 'You have no records yet',
        noMatchesText: 'No records found matching filter.',
        searchFieldName: 'number',
        columns: [
          {
            title: 'Record number',
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
            title: 'Total',
            className: 'min-tablet-l',
            render: row => $filter('defaultCurrency')(row.total)
          },
          {
            title: 'Record period',
            className: 'all',
            render: row => BillingUtils.formatPeriod(row)
          },
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
    },
    getFilter: function() {
      return {
        customer: this.currentCustomer.url
      };
    }
  });

  controllerScope.__proto__ = new InvoicesController();
}

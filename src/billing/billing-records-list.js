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
  BillingUtils,
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
        noDataText: gettext('You have no records yet.'),
        noMatchesText: gettext('No records found matching filter.'),
        searchFieldName: 'number',
        columns: [
          {
            title: gettext('Record number'),
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
            title: gettext('Record period'),
            className: 'all',
            render: row => BillingUtils.formatPeriod(row)
          },
          {
            title: '<price-tooltip></price-tooltip>' + gettext('Total'),
            className: 'all',
            render: row => $filter('defaultCurrency')(row.price)
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
      return BillingUtils.getUserFilter();
    },
    getFilter: function() {
      return {
        customer: this.currentCustomer.url
      };
    }
  });

  controllerScope.__proto__ = new InvoicesController();
}

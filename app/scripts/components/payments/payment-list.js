const paymentsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: PaymentsListController,
  controllerAs: 'ListController',
};

export default paymentsList;

// @ngInject
function PaymentsListController(
  baseControllerListClass,
  paymentsService,
  $filter,
  baseResourceListController) {
  var controllerScope = this;
  var PaymentsController = baseControllerListClass.extend({
    init: function() {
      this.service = paymentsService;
      this._super();

      this.tableOptions = {
        searchFieldName: 'type',
        noDataText: gettext('No payments yet'),
        noMatchesText: gettext('No payments found matching filter.'),
        columns: [
          {
            title: gettext('State'),
            className: 'all',
            render: function(row) {
              return baseResourceListController.renderResourceState(row);
            }
          },
          {
            title: gettext('Type'),
            className: 'all',
            render: function(row) {
              return row.type || 'N/A';
            }
          },
          {
            title: gettext('Date'),
            className: 'all',
            render: function(row) {
              return $filter('dateTime')(row.created);
            },
          },
          {
            title: gettext('Amount'),
            className: 'all',
            render: function(row) {
              return $filter('defaultCurrency')(row.amount);
            },
          }
        ],
      };
    },
    afterGetList: function() {
      this._super();
      angular.forEach(this.list, function(payment) {
        payment.type = 'PayPal';
      });
    }
  });

  controllerScope.__proto__ = new PaymentsController();
}

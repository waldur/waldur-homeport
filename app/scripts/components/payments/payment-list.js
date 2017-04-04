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
  $filter) {
  var controllerScope = this;
  var PaymentsController = baseControllerListClass.extend({
    init: function() {
      this.service = paymentsService;
      this._super();
      var vm = this;

      this.tableOptions = {
        searchFieldName: 'type',
        noDataText: gettext('No payments yet'),
        noMatchesText: gettext('No payments found matching filter.'),
        columns: [
          {
            title: gettext('State'),
            className: 'all',
            render: function(row) {
              var index = vm.findIndexById(row);
              return '<payment-state payment="controller.list[{index}]"></payment-state>'
                .replace('{index}', index);
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

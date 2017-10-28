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
  let controllerScope = this;
  let PaymentsController = baseControllerListClass.extend({
    init: function() {
      this.service = paymentsService;
      this._super();
      let vm = this;

      this.tableOptions = {
        searchFieldName: 'type',
        noDataText: gettext('No payments yet'),
        noMatchesText: gettext('No payments found matching filter.'),
        columns: [
          {
            title: gettext('State'),
            className: 'all',
            render: function(row) {
              let index = vm.findIndexById(row);
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
              return $filter('dateTime')(row.created) || 'N/A';
            },
          },
          {
            title: gettext('Amount'),
            className: 'all',
            render: function(row) {
              return $filter('defaultCurrency')(row.amount) || 'N/A';
            },
          }
        ],
      };
    },
    afterGetList: function() {
      angular.forEach(this.list, function(payment) {
        payment.type = 'PayPal';
      });
    }
  });

  controllerScope.__proto__ = new PaymentsController();
}

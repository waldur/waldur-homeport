const agreementsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: CustomerAgreementsTabController,
  controllerAs: 'ListController',
};

export default agreementsList;

// @ngInject
function CustomerAgreementsTabController(
  baseControllerListClass,
  agreementsService,
  $filter) {
  var controllerScope = this;
  var AgreementsController = baseControllerListClass.extend({
    init: function() {
      this.service = agreementsService;
      this._super();
      var vm = this;

      this.tableOptions = {
        searchFieldName: 'plan_name',
        noDataText: gettext('No plans yet.'),
        noMatchesText: gettext('No plans found matching filter.'),
        columns: [
          {
            title: gettext('State'),
            className: 'all',
            render: function(row) {
              var index = vm.findIndexById(row);
              return '<plan-agreement-state agreement="controller.list[{index}]"></plan-agreement-state>'
                .replace('{index}', index);
            }
          },
          {
            title: gettext('Plan name'),
            render: function(row) {
              return row.plan_name || 'N/A';
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
            title: gettext('Price'),
            className: 'all',
            render: function(row) {
              return $filter('defaultCurrency')(row.plan_price) || 'N/A';
            },
          }
        ],
      };
    }
  });

  controllerScope.__proto__ = new AgreementsController();
}

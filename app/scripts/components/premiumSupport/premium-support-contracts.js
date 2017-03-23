import template from './premium-support-contracts.html';

const premiumSupportContracts = {
    template: template,
    controller: ContractsListController,
    controllerAs: 'ListController',
};

// @ngInject
function ContractsListController(
  baseControllerListClass,
  premiumSupportContractsService,
  currentStateService,
  ENV,
  $filter,
  $stateParams) {
  var controllerScope = this;
  var ResourceController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = premiumSupportContractsService;
      this._super();
    },
    getTableOptions: function() {
      return {
        searchFieldName: 'name',
        noDataText: gettext('You have no SLAs yet.'),
        noMatchesText: gettext('No SLAs found matching filter.'),
        columns: [
          {
            title: gettext('Name'),
            className: 'all',
            render: function(row) {
              return row.plan_name || 'N/A';
            }
          },
          {
            title: gettext('State'),
            className: 'all',
            render: function(row) {
              return row.state || 'N/A';
            }
          },
          {
            title: gettext('Description'),
            className: 'desktop',
            render: function(row) {
              return row.plan_description || 'N/A';
            }
          },
          {
            title: gettext('Base rate'),
            className: 'desktop',
            render: function(row) {
              return $filter('currency')(row.base_rate, ENV.currency) || 'N/A';
            }
          },
          {
            title: gettext('Hour rate'),
            className: 'desktop',
            render: function(row) {
              return $filter('currency')(row.hour_rate, ENV.currency) || 'N/A';
            }
          },
          {
            title: gettext('Terms'),
            className: 'desktop',
            render: function(row) {
              return row.plan_terms || 'N/A';
            }
          },
        ],
      };
    },
    afterGetList: function() {
      this.tableOptions = this.getTableOptions();
    },
    getList: function(filter) {
      var vm = this;
      var fn = this._super.bind(vm);
      if ($stateParams.uuid) {
        this.service.defaultFilter.project_uuid = $stateParams.uuid;
        return fn(filter);
      }
      return currentStateService.getProject().then(function(project) {
        vm.service.defaultFilter.project_uuid = project.uuid;
        return fn(filter);
      });
    },
  });

  controllerScope.__proto__ = new ResourceController();
}

export default premiumSupportContracts;

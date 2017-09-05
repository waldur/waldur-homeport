const slurmAllocationList = {
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: SlurmAllocationListController,
};

// @ngInject
function SlurmAllocationListController(baseResourceListController, $filter, SlurmAllocationService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = SlurmAllocationService;
      this.addRowFields(['cpu_limit', 'cpu_usage']);
    },
    getTableOptions: function() {
      var options = this._super();
      options.disableSearch = true;
      options.noDataText = gettext('No allocations yet.');
      options.noMatchesText = gettext('No allocations found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('Description'),
          render: row => row.description || 'N/A'
        },
        {
          title: gettext('Created'),
          render: row => $filter('shortDate')(row.created),
        },
        {
          title: gettext('CPU limit'),
          render: row => row.cpu_limit + ' minutes',
        },
        {
          title: gettext('CPU usage'),
          render: row => row.cpu_usage + ' minutes',
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: row => this.renderResourceState(row)
        },
      ];
      return options;
    },
    getTableActions: function() {
      return [this.getCreateAction()];
    },
    getCategoryKey: function() {
      return 'slurm';
    },
    getCategoryState: function() {
      return 'appstore.slurm';
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default slurmAllocationList;

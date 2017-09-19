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
      this.addRowFields([
        'cpu_limit', 'cpu_usage',
        'gpu_limit', 'gpu_usage',
        'ram_limit', 'ram_usage',
      ]);
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
          render: row => $filter('minutesToHours')(row.cpu_limit),
        },
        {
          title: gettext('CPU usage'),
          render: row => $filter('minutesToHours')(row.cpu_usage),
        },
        {
          title: gettext('GPU limit'),
          render: row => $filter('minutesToHours')(row.gpu_limit),
        },
        {
          title: gettext('GPU usage'),
          render: row => $filter('minutesToHours')(row.gpu_usage),
        },
        {
          title: gettext('RAM limit'),
          render: row => $filter('filesize')(row.ram_limit),
        },
        {
          title: gettext('RAM usage'),
          render: row => $filter('filesize')(row.ram_usage),
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
    },
    getFilter: function() {
      return {
        project_uuid: this.currentProject.uuid
      };
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default slurmAllocationList;

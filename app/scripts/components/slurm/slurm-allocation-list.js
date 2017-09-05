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
          render: row => $filter('shortDate')(row.created) || '&mdash;'
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: row => this.renderResourceState(row)
        },
      ];
      return options;
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default slurmAllocationList;

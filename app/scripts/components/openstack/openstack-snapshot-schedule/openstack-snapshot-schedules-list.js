const openstackSnapshotSchedulesList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: openstackSnapshotSchedulesListController,
  controllerAs: 'ListController',
  bindings: {
    resource: '<'
  }
};

// @ngInject
function openstackSnapshotSchedulesListController(
  baseResourceListController, openstackSnapshotSchedulesService, actionUtilsService, $filter) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      var fn = this._super.bind(this);
      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, 'snapshot_schedules').then(result => {
        this.listActions = result;
        fn();
        this.service = openstackSnapshotSchedulesService;
        this.rowFields.push('schedule', 'maximal_number_of_resources');
      });
    },
    getTableOptions: function() {
      var options = this._super();
      options.disableSearch = true;
      options.noDataText = 'No snapshot schedules yet.';
      options.noMatchesText = 'No snapshot schedules found matching filter.';
      options.tableActions = this.listActions;
      options.columns = [
        {
          title: 'Name',
          className: 'all',
          render: row => this.renderResourceName(row)
        },
        {
          title: 'Max number of SNAPSHOTS',
          render: row => row.maximal_number_of_resources || '&mdash;'
        },
        {
          title: 'Schedule',
          className: 'min-tablet-l',
          render: row => $filter('formatCrontab')(row.schedule)
        },
        {
          title: 'State',
          className: 'min-tablet-l',
          render: row => this.renderResourceState(row)
        },
      ];
      return options;
    },
    getFilter: function() {
      return {
        instance: controllerScope.resource.url
      };
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackSnapshotSchedulesList;

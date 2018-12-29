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
  let controllerScope = this;
  let controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      let fn = this._super.bind(this);
      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, 'snapshot_schedules').then(result => {
        this.listActions = result;
        fn();
        this.service = openstackSnapshotSchedulesService;
        this.addRowFields(['schedule', 'maximal_number_of_resources', 'is_active']);
      });
    },
    getTableOptions: function() {
      let options = this._super();
      options.disableSearch = true;
      options.noDataText = gettext('No snapshot schedules yet.');
      options.noMatchesText = gettext('No snapshot schedules found matching filter.');
      options.tableActions = this.listActions;
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          orderField: 'name',
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('Max number of snapshots'),
          render: row => row.maximal_number_of_resources || '&mdash;'
        },
        {
          title: gettext('Schedule'),
          className: 'min-tablet-l',
          render: row => $filter('formatCrontab')(row.schedule)
        },
        {
          title: gettext('Is active'),
          render: row => `<i class="fa ${row.is_active ? 'fa-check' : 'fa-minus'}"></i>`
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: row => this.renderResourceState(row)
        },
      ];
      return options;
    },
    getFilter: function() {
      return {
        source_volume: controllerScope.resource.url
      };
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackSnapshotSchedulesList;

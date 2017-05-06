const openstackBackupSchedulesList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: openstackBackupSchedulesListController,
  controllerAs: 'ListController',
  bindings: {
    resource: '<'
  }
};

// @ngInject
function openstackBackupSchedulesListController(
  baseResourceListController, openstackBackupSchedulesService, actionUtilsService, $filter) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      var fn = this._super.bind(this);
      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, 'backup_schedules').then(result => {
        this.listActions = result;
        fn();
        this.service = openstackBackupSchedulesService;
        this.rowFields.push('schedule', 'maximal_number_of_resources', 'is_active', 'retention_time', 'timezone');
      });
    },
    getTableOptions: function() {
      var options = this._super();
      options.disableSearch = true;
      options.noDataText = gettext('No backup schedules yet.');
      options.noMatchesText = gettext('No backup schedules found matching filter.');
      options.tableActions = this.listActions;
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('Max number of backups'),
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
        instance: controllerScope.resource.url
      };
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackBackupSchedulesList;

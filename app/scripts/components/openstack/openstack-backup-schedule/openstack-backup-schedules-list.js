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
  baseResourceListController, openstackBackupSchedulesService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackBackupSchedulesService;
      this.rowFields.push('schedule', 'maximal_number_of_backups');
    },
    getTableOptions: function() {
      var options = this._super();
      options.disableSearch = true;
      options.noDataText = 'No backup schedules yet.';
      options.noMatchesText = 'No backup schedules found matching filter.';
      options.columns = [
        {
          title: 'Name',
          className: 'all',
          render: row => this.renderResourceName(row)
        },
        {
          title: 'Max number of backups',
          render: row => row.maximal_number_of_backups || '&mdash;'
        },
        {
          title: 'Schedule',
          className: 'min-tablet-l',
          render: row => row.schedule
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

export default openstackBackupSchedulesList;

export default function backupScheduleBackupsList() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: BackupScheduleBackupsListController,
    controllerAs: 'ListController',
    scope: {},
    bindToController: {
      resource: '='
    }
  };
}

// @ngInject
function BackupScheduleBackupsListController(
  baseResourceListController, openstackBackupsService, $filter) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackBackupsService;
      this.rowFields.push('kept_until');
    },
    getTableOptions: function() {
      var options = this._super();
      options.disableSearch = true;
      options.noDataText = 'No backups yet.';
      options.noMatchesText = 'No backups found matching filter.';
      options.columns = [
        {
          title: 'Name',
          className: 'all',
          render: row => this.renderResourceName(row)
        },
        {
          title: 'Keep until',
          render: row => $filter('shortDate')(row.kept_until) || '&mdash;'
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
        instance: controllerScope.resource.url,
      };
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

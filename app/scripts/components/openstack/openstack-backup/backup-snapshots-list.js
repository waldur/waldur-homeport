export default function openStackBackupsList() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: backupSnapshotsListController,
    controllerAs: 'ListController',
    scope: {},
    bindToController: {
      resource: '='
    }
  };
}

// @ngInject
function backupSnapshotsListController(
  baseResourceListController, openstackSnapshotsService, $filter) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackSnapshotsService;
      this.rowFields.push('size');
      this.rowFields.push('created');
    },
    getTableOptions: function() {
      var options = this._super();
      options.disableSearch = true;
      options.noDataText = 'No snapshots yet.';
      options.noMatchesText = 'No snapshots found matching filter.';
      options.columns = [
        {
          title: 'Name',
          className: 'all',
          render: row => this.renderResourceName(row)
        },
        {
          title: 'State',
          className: 'min-tablet-l',
          render: row => this.renderResourceState(row)
        },
        {
          title: 'Description',
          render: row => row.description || 'N/A'
        },
        {
          title: 'Size',
          render: row => $filter('filesize')(row.size)
        },
        {
          title: 'Created',
          render: row => $filter('shortDate')(row.created) || '&mdash;'
        }
      ];
      return options;
    },
    getFilter: function() {
      return {backup_uuid: controllerScope.resource.uuid};
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

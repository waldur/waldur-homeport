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
  let controllerScope = this;
  let controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackSnapshotsService;
      this.addRowFields(['size', 'created']);
    },
    getTableOptions: function() {
      let options = this._super();
      options.disableSearch = true;
      options.noDataText = gettext('No snapshots yet.');
      options.noMatchesText = gettext('No snapshots found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          orderField: 'name',
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('Description'),
          render: row => row.description || 'N/A'
        },
        {
          title: gettext('Size'),
          render: row => $filter('filesize')(row.size)
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
    getFilter: function() {
      return {backup_uuid: controllerScope.resource.uuid};
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

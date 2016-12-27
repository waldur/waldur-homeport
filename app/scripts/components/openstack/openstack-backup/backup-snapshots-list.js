export default function openStackBackupsList() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: backupSnapshotsListController,
    controllerAs: 'ListController',
    scope: {},
    bindToController: {
      backupUUID: '='
    }
  };
}

// @ngInject
function backupSnapshotsListController(
  baseControllerListClass, openstackSnapshotsService, $filter) {
  var controllerScope = this;
  var controllerClass = baseControllerListClass.extend({
    init: function() {
      this.service = openstackSnapshotsService;
      this.controllerScope = controllerScope;
      this._super();
      this.tableOptions = {
        disableSearch: true,
        enableOrdering: true,
        searchFieldName: 'summary',
        entityData: {
          noDataText: 'No backups yet.',
          noMatchesText: 'No backups found matching filter.',
        },
        columns: [
          {
            title: 'Name',
            orderField: 'name',
            render: function(row) {
              return row.name;
            },
            width: 90
          },
          {
            title: 'Description',
            orderField: 'description',
            render: function(row) {
              return row.description;
            },
            width: 90
          },
          {
            title: 'Size',
            orderField: 'size',
            render: function(row) {
              return $filter('filesize')(row.size);
            },
            width: 50
          },
          {
            title: 'Created',
            orderField: 'created',
            render: function(row) {
              return $filter('shortDate')(row.created) || '&mdash;';
            },
            width: 50
          }
        ]
      };
    },
    getFilter: function() {
      return {backup_uuid: controllerScope.backupUUID};
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

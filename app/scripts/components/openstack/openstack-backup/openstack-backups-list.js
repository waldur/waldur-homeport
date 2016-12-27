export default function openStackBackupsList() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: OpenStackBackupsListController,
    controllerAs: 'ListController',
    scope: {},
    bindToController: {
      instanceUrl: '='
    }
  };
}

// @ngInject
function OpenStackBackupsListController(
  baseControllerListClass, openstackBackupsService, $filter, $state, ncUtils) {
  var controllerScope = this;
  var controllerClass = baseControllerListClass.extend({
    init: function() {
      this.service = openstackBackupsService;
      this.controllerScope = controllerScope;
      this._super();
      this.tableOptions = {
        // disableAutoUpdate: true,
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
              var href = $state.href('resources.details', {resource_type: 'OpenStackTenant.Backup', uuid: row.uuid});
              return ncUtils.renderLink(href, row.name);
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
            title: 'Keep until',
            orderField: 'kept_until',
            render: function(row) {
              return $filter('shortDate')(row.kept_until) || '&mdash;';
            },
            width: 50
          }
        ]
      };
    },
    getFilter: function() {
      return {instance: controllerScope.instanceUrl};
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

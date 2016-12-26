import template from './openstack-backups-list.html';

export default function openStackBackupsList() {
  return {
    restrict: 'E',
    template: template,
    controller: OpenStackBackupsListController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {}
  };
}

// @ngInject
function OpenStackBackupsListController(
  baseControllerListClass, openstackBackupsService, $filter, $scope, $rootScope, $state, ncUtils) {
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
              return row.kept_until || '&mdash;';
            },
            width: 50
          }
        ]
      };
    },
    getFilter: function() {
      return controllerScope.filter;
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

const restoredVolumesList = {
  controller: RestoredVolumesListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
  bindings: {
    resource: '<'
  },
};

export default restoredVolumesList;

// @ngInject
function RestoredVolumesListController(ncUtils, $state, $filter, openstackSnapshotsService, baseResourceListController) {
  var controllerScope = this;
  var ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackSnapshotsService;
    },
    getFilter: function() {
      return {
        operation: 'restorations',
        UUID: controllerScope.resource.uuid
      };
    },
    getTableOptions: function() {
      var vm = this.controllerScope;
      return {
        searchFieldName: 'name',
        noDataText: 'You have no resources yet.',
        noMatchesText: 'No resources found matching filter.',
        columns: [
          {
            title: 'Volume name',
            className: 'all',
            render: function(row) {
              var href = $state.href('resources.details', {
                uuid: ncUtils.getUUID(row.volume),
                resource_type: 'OpenStackTenant.Volume'
              });
              return ncUtils.renderLink(href, row.volume_name);
            }
          },
          {
            title: 'Created',
            className: 'desktop',
            render: function(row) {
              return $filter('shortDate')(row.created) || '&mdash;';
            }
          },
          {
            title: 'State',
            className: 'min-tablet-l',
            render: function(row) {
              return vm.renderResourceState(row);
            }
          }
        ],
        tableActions: this.getTableActions(),
      };
    },
  });
  controllerScope.__proto__ = new ResourceController();
}

const volumeSnapshots = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: VolumeSnapshotsListController,
  controllerAs: 'ListController',
  bindings: {
    resource: '<'
  }
};

export default volumeSnapshots;

// @ngInject
function VolumeSnapshotsListController(
  baseResourceListController,
  $scope,
  $timeout,
  actionUtilsService) {
  var controllerScope = this;
  var ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      var list_type = 'snapshots';
      var fn = this._super.bind(this);
      var vm = this;

      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(function(result) {
        vm.listActions = result;
        fn();
      });

      $scope.$on('actionApplied', function(event, name) {
        if (name === 'snapshot') {
          $timeout(function() {
            controllerScope.resetCache();
          });
        }
      });
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'You have no snapshots yet';
      options.noMatchesText = 'No snapshots found matching filter.';
      return options;
    },
    getFilter: function() {
      return {
        source_volume_uuid: controllerScope.resource.uuid,
        resource_type: 'OpenStackTenant.Snapshot'
      };
    },
    getTableActions: function() {
      return this.listActions;
    },
  });
  controllerScope.__proto__ = new ResourceController();
}

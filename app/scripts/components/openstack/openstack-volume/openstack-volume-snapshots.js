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
  $timeout) {
  var controllerScope = this;
  var ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.controllerScope.list_type = 'volume_snapshot';
      this._super();

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
    }
  });
  controllerScope.__proto__ = new ResourceController();
}

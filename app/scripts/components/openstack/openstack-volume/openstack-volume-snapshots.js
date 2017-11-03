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
  let controllerScope = this;
  let ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      let list_type = 'snapshots';
      let fn = this._super.bind(this);

      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(result => {
        this.listActions = result;
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
      let options = this._super();
      options.noDataText = gettext('You have no snapshots yet.');
      options.noMatchesText = gettext('No snapshots found matching filter.');
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

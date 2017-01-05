const instanceVolumes = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: OpenstackVolumesList,
  controllerAs: 'ListController',
  bindings: {
    resource: '<'
  }
};

export default instanceVolumes;

// @ngInject
function OpenstackVolumesList(
  baseResourceListController,
  $scope,
  $timeout,
  openstackVolumesService) {
  var controllerScope = this;
  var ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackVolumesService;
      this.rowFields.push('size');

      $scope.$on('actionApplied', function(event, name) {
        if (name === 'volume') {
          $timeout(function() {
            controllerScope.resetCache();
          });
        }
      });
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'You have no volumes yet';
      options.noMatchesText = 'No volumes found matching filter.';
      return options;
    },
    getFilter: function() {
      return {
        instance_uuid: controllerScope.resource.uuid
      };
    }
  });
  controllerScope.__proto__ = new ResourceController();
}

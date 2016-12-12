import template from './openstack-volumes-list.html';

export default function openstackVolumesList() {
  return {
    restrict: 'E',
    template: template,
    controller: OpenstackVolumesList,
    controllerAs: 'ListController'
  };
}

// @ngInject
function OpenstackVolumesList(
  baseResourceListController,
  $stateParams,
  $scope,
  $timeout,
  openstackVolumesService) {
  var controllerScope = this;
  var ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackVolumesService;

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
        instance_uuid: $stateParams.uuid
      };
    }
  });
  controllerScope.__proto__ = new ResourceController();
}

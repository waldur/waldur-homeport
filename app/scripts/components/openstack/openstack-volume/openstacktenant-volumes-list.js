import template from './openstacktenant-volumes-list.html';

export default function openstacktenantVolumesList() {
  return {
    restrict: 'E',
    template: template,
    controller: OpenstacktenantVolumesList,
    controllerAs: 'ListController'
  };
}

// @ngInject
function OpenstacktenantVolumesList(
  baseResourceListController,
  $stateParams,
  $scope,
  $timeout,
  openstackTenantVolumesService) {
  var controllerScope = this;
  var ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = openstackTenantVolumesService;
      this._super();

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

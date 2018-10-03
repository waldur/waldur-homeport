import template from './volume-extend.html';

export default function volumeExtendDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: VolumeExtendDialogController,
  };
}

// @ngInject
function VolumeExtendDialogController($scope, resourcesService, actionUtilsService) {
  $scope.minSize = Math.round($scope.resource.size / 1024) + 1;
  $scope.options = {newSize: $scope.minSize};
  $scope.submitForm = function() {
    let form = resourcesService.$create($scope.action.url);
    form.disk_size = $scope.options.newSize * 1024;
    return form.$save().then(() => {
      actionUtilsService.handleActionSuccess($scope.action);
      $scope.errors = {};
      $scope.$close();
      $scope.controller.reInitResource($scope.resource);
    }).catch(response => {
      $scope.errors = response.data;
    });
  };
}

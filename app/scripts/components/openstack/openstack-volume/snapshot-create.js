import template from './snapshot-create.html';

export default function snapshotCreateDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: SnapshotCreateDialogController,
  };
}

// @ngInject
function SnapshotCreateDialogController($q, $rootScope, $scope, resourcesService, actionUtilsService) {
  $scope.snapshot = {
    name: $scope.resource.name + '-snapshot'
  };
  $scope.submitForm = function() {
    if ($scope.SnapshotForm.$invalid) {
      return $q.reject();
    }
    let form = resourcesService.$create($scope.action.url);
    form.name = $scope.snapshot.name;
    form.description = $scope.snapshot.description;
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

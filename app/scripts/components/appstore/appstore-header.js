import template from './appstore-header.html';

export function appstoreHeader() {
  return {
    restrict: 'E',
    template: template,
  }
}

// @ngInject
export function AppStoreHeaderController($scope, $state, AppStoreUtilsService) {
  $scope.openDialog = function() {
    AppStoreUtilsService.openDialog();
  };
  refreshCategory();
  $scope.$on('$stateChangeSuccess', refreshCategory);
  function refreshCategory() {
    var category = $state.$current.data.category;
    if (category) {
      $scope.category = AppStoreUtilsService.findOffering(category);
    }
  }
}

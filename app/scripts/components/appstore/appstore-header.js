import template from './appstore-header.html';

export function appstoreHeader() {
  return {
    restrict: 'E',
    template: template,
  };
}

// @ngInject
export function AppStoreHeaderController($scope, $state, $stateParams, AppStoreUtilsService) {
  $scope.openDialog = function() {
    AppStoreUtilsService.openDialog();
  };
  refreshCategory();
  $scope.$on('$stateChangeSuccess', refreshCategory);
  function refreshCategory() {
    var category = $state.current.data.category || $stateParams.category;
    if (category) {
      $scope.category = AppStoreUtilsService.findCategory(category);
    }
  }
}

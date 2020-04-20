import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

import template from './user-details.html';

// @ngInject
function UserDetailsController(
  $scope,
  $state,
  $stateParams,
  usersService,
  stateUtilsService,
  currentStateService,
  WorkspaceService,
) {
  function updateSidebar() {
    usersService.getCurrentUser().then(function(user) {
      if (
        angular.isUndefined($stateParams.uuid) ||
        $stateParams.uuid === user.uuid
      ) {
        $scope.isPrivate = true;
        $scope.currentUser = user;
        WorkspaceService.setWorkspace({
          hasCustomer: true,
          workspace: WOKSPACE_NAMES.user,
          currentUser: user,
        });
      } else {
        usersService
          .$get($stateParams.uuid)
          .then(function(user) {
            $scope.currentUser = user;
            $scope.isPrivate = false;
            WorkspaceService.setWorkspace({
              hasCustomer: true,
              workspace: WOKSPACE_NAMES.user,
              currentUser: user,
            });
          })
          .catch(function(response) {
            if (response.status === 404) {
              $state.go('errorPage.notFound');
            }
          });
      }
    });
  }
  $scope.$on('hasCustomer', updateSidebar);
  // $scope.$on('ownerOrStaff', updateSidebar);
  updateSidebar();
}

export default function userDetails() {
  return {
    restrict: 'E',
    template: template,
    controller: UserDetailsController,
  };
}

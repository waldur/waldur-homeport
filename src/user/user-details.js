import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

import { PRIVATE_USER_TABS, getPublicUserTabs } from './constants';
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
  SidebarExtensionService,
) {
  function getDashboardTab(user) {
    const prevWorkspace = stateUtilsService.getPrevWorkspace();
    if (prevWorkspace === 'project') {
      return {
        label: gettext('Back to project'),
        icon: 'fa-arrow-left',
        action: stateUtilsService.goBack,
      };
    } else if (
      prevWorkspace === 'organization' &&
      (currentStateService.getOwnerOrStaff() || user.is_support)
    ) {
      return {
        label: gettext('Back to organization'),
        icon: 'fa-arrow-left',
        action: stateUtilsService.goBack,
      };
    }
  }

  function updateSidebar() {
    usersService.getCurrentUser().then(function(user) {
      const dashboardTab = getDashboardTab(user);
      if (
        angular.isUndefined($stateParams.uuid) ||
        $stateParams.uuid === user.uuid
      ) {
        if (dashboardTab) {
          $scope.items = SidebarExtensionService.filterItems(
            [dashboardTab].concat(PRIVATE_USER_TABS),
          );
        } else {
          $scope.items = SidebarExtensionService.filterItems(PRIVATE_USER_TABS);
        }
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
            if (dashboardTab) {
              $scope.items = SidebarExtensionService.filterItems(
                [dashboardTab].concat(getPublicUserTabs(user)),
              );
            } else {
              $scope.items = SidebarExtensionService.filterItems(
                getPublicUserTabs(user),
              );
            }
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

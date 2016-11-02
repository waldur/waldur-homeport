import template from './user-details.html';

export default function userDetails() {
  return {
    restrict: 'E',
    template: template,
    controller: UserDetailsController,
  };
}

export const PRIVATE_USER_TABS = [
  {
      label: "Audit logs",
      icon: "fa-bell-o",
      link: "profile.details"
  },
  {
      label: "SSH Keys",
      icon: "fa-key",
      link: "profile.keys"
  },
  {
      label: "Notifications",
      icon: "fa-envelope",
      link: "profile.notifications",
      feature: "notifications"
  },
  {
      label: "Manage",
      icon: "fa-wrench",
      link: "profile.manage"
  }
];

// @ngInject
function UserDetailsController($scope, $stateParams, usersService, PRIVATE_USER_TABS, stateUtilsService) {
  var publicTabs = [
    {
        label: "Audit logs",
        icon: "fa-bell-o",
        link: "users.details({uuid: context.user.uuid})"
    },
    {
        label: "SSH Keys",
        icon: "fa-key",
        link: "users.keys({uuid: context.user.uuid})"
    }
  ];
  var prevWorkspace = stateUtilsService.getPrevWorkspace() || 'organization';
  var dashboardTab;
  if (prevWorkspace === 'project') {
    dashboardTab = {
      label: "Back to project",
      icon: "fa-arrow-left",
      action: stateUtilsService.goBack
    };
  } else {
    dashboardTab = {
      label: "Back to organization",
      icon: "fa-arrow-left",
      link: "dashboard.index"
    };
  }
  usersService.getCurrentUser().then(function(user) {
    if (angular.isUndefined($stateParams.uuid) || $stateParams.uuid === user.uuid) {
      $scope.items = [dashboardTab].concat(PRIVATE_USER_TABS);
      $scope.currentUser = user;
      $scope.context = {user: user};
    } else {
      usersService.$get($stateParams.uuid).then(function(user) {
        $scope.items = [dashboardTab].concat(publicTabs);
        $scope.currentUser = user;
        $scope.context = {user: user};
      });
    }
  });
}

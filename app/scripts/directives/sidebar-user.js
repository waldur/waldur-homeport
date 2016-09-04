'use strict';

(function() {
  angular.module('ncsaas')
    .directive('sidebarUser', [sidebarUser]);

    function sidebarUser() {
      return {
        restrict: 'E',
        templateUrl: 'views/directives/sidebar-user.html',
        replace: true,
        controller: 'SidebarUserController',
        controllerAs: 'Ctrl',
        bindToController: true,
      };
    }

  angular.module('ncsaas')
    .controller('SidebarUserController', [
      '$scope', '$rootScope', 'usersService', 'PRIVATE_USER_TABS',
      SidebarUserController
    ]);

  function SidebarUserController($scope, $rootScope, usersService, PRIVATE_USER_TABS) {
    var ctrl = this;
    ctrl.items = PRIVATE_USER_TABS;
    ctrl.logout = $rootScope.logout;
    usersService.getCurrentUser().then(function(user) {
      ctrl.user = user;
    });
  }
})();

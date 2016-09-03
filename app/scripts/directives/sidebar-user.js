'use strict';

(function() {
  angular.module('ncsaas')
    .directive('sidebarUser', [sidebarUser]);

    function sidebarUser() {
      return {
        restrict: 'E',
        templateUrl: "views/directives/sidebar-user.html",
        replace: true,
        controller: 'SidebarUserController',
        controllerAs: 'Ctrl',
        bindToController: true,
      };
    }

  angular.module('ncsaas')
    .controller('SidebarUserController', [
      '$scope', 'usersService', SidebarUserController
    ]);

  function SidebarUserController($scope, usersService) {
    var ctrl = this;
    usersService.getCurrentUser().then(function(user) {
      ctrl.user = user;
    });
  }
})();

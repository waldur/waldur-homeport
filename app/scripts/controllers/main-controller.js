'use strict';

(function() {
  angular.module('ncsaas')
    .controller('MainController', ['$rootScope', 'authService', '$state', MainController]);

  function MainController($rootScope, authService, $state) {
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'home' || toState.name === 'login'){
        if (authService.getAuthCookie() != null){
          $state.go('dashboard');
        }
      }
    });
  }
})();

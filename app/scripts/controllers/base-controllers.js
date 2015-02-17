'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderController', ['$scope', 'currentStateService', 'customersService', HeaderController]);

  function HeaderController($scope, currentStateService, customersService) {
    var vm = this;

    vm.customers = customersService.getCustomersList();
    vm.getUser = currentStateService.getUser;
    vm.getCustomer = currentStateService.getCustomer;
    vm.menuToggle = menuToggle;
    vm.setCurrentCustomer = currentStateService.setCustomer;
    // top-level menu
    vm.menuState = {
      addSomethingMenu : false,
      combineMenu : false,
      customerMenu : false,
      profileMenu : false
    };

    function menuToggle(active) {
      for (var property in vm.menuState) {
        if (vm.menuState.hasOwnProperty(property)) {
          if (property !== active) {
            vm.menuState[property] = false;
          }
        }
      }
      event.stopPropagation();
      vm.menuState[active] = !vm.menuState[active];
    }

    window.onclick = function() {
      for (var property in vm.menuState) {
        if (vm.menuState.hasOwnProperty(property)) {
          vm.menuState[property] = false;
        }
      }
      $scope.$apply();
    };

  }

  angular.module('ncsaas')
    .controller('MainController', ['$rootScope', '$state', 'BodyClassService', MainController]);

    function MainController($rootScope, $state, BodyClassService) {
      var vm = this;

      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $rootScope.bodyClass = BodyClassService.getBodyClass(toState.name);

        if (toState.name === 'home' || toState.name === 'login'){
          if (authService.getAuthCookie() != null){
            $state.go('dashboard');
          }
        }
      });
    }

})();

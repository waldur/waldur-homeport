'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderController', ['$scope', '$state', 'currentStateService', 'customersService', HeaderController]);

  function HeaderController($scope, $state, currentStateService, customersService) {
    var vm = this;

    vm.customers = customersService.getCustomersList();
    vm.getUser = currentStateService.getUser;
    vm.currentCustomer = {};
    vm.menuToggle = menuToggle;
    vm.setCurrentCustomer = setCurrentCustomer;

    // initiate current controller
    currentStateService.getCustomer().then(function(response) {
      vm.currentCustomer = response;
    });

    function setCurrentCustomer(customer) {
      currentStateService.setCustomer(customer);
      vm.currentCustomer = customer;
    }

    // top-level menu
    vm.menuState = {
      addSomethingMenu : false,
      combineMenu : false,
      customerMenu : false,
      profileMenu : false
    };
    // top-level menu active state
    vm.menuItemActive = currentStateService.getActiveItem($state.current.name);

    function menuToggle(active, event) {
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
    .controller('MainController', ['$rootScope', '$state', 'authService', 'currentStateService', MainController]);

    function MainController($rootScope, $state, authService, currentStateService) {
      var vm = this;

      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $rootScope.bodyClass = currentStateService.getBodyClass(toState.name);

        if (toState.name === 'home' || toState.name === 'login'){
          if (authService.getAuthCookie() != null){
            $state.go('dashboard');
          }
        }
      });
    }

})();
